import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Products Management (E2E)', () => {
  let app: INestApplication;
  let authToken: string;
  let vendorToken: string;
  let productId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    // Create admin user and get token
    const adminResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `admin-${Date.now()}@example.com`,
        password: 'Admin@1234',
        firstName: 'Admin',
        lastName: 'User',
        phoneNumber: '+2348012345681',
      });

    authToken = adminResponse.body.data.accessToken;

    // Create vendor user and get token
    const vendorResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `vendor-${Date.now()}@example.com`,
        password: 'Vendor@1234',
        firstName: 'Vendor',
        lastName: 'User',
        phoneNumber: '+2348012345682',
      });

    vendorToken = vendorResponse.body.data.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /products', () => {
    it('should create a new product', async () => {
      const response = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({
          name: 'Paracetamol 500mg',
          description: 'Pain relief medication',
          sku: `SKU-${Date.now()}`,
          barcode: `BC-${Date.now()}`,
          category: 'Pain Relief',
          price: 500,
          costPrice: 300,
          quantity: 100,
          minQuantity: 10,
          expiryDate: '2025-12-31',
          manufacturer: 'Generic Pharma',
          requiresPrescription: false,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Paracetamol 500mg');
      expect(response.body.data.price).toBe(500);

      productId = response.body.data.id;
    });

    it('should reject product creation with duplicate SKU', async () => {
      const sku = `SKU-DUPLICATE-${Date.now()}`;

      // Create first product
      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({
          name: 'Product 1',
          sku,
          price: 100,
          costPrice: 50,
          quantity: 10,
        })
        .expect(201);

      // Try to create duplicate
      return request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({
          name: 'Product 2',
          sku,
          price: 100,
          costPrice: 50,
          quantity: 10,
        })
        .expect(409);
    });

    it('should reject product with invalid price', () => {
      return request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({
          name: 'Invalid Product',
          sku: `SKU-${Date.now()}`,
          price: -100,
          costPrice: 50,
          quantity: 10,
        })
        .expect(400);
    });
  });

  describe('GET /products', () => {
    it('should get all products with pagination', () => {
      return request(app.getHttpServer())
        .get('/products?page=1&limit=10')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('items');
          expect(res.body.data).toHaveProperty('meta');
          expect(Array.isArray(res.body.data.items)).toBe(true);
        });
    });

    it('should filter products by category', () => {
      return request(app.getHttpServer())
        .get('/products?category=Pain Relief')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data.items)).toBe(true);
        });
    });

    it('should search products by name', () => {
      return request(app.getHttpServer())
        .get('/products?search=Paracetamol')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data.items)).toBe(true);
        });
    });
  });

  describe('GET /products/:id', () => {
    it('should get a product by id', () => {
      return request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data).toHaveProperty('name');
          expect(res.body.data).toHaveProperty('price');
        });
    });

    it('should return 404 for non-existent product', () => {
      return request(app.getHttpServer())
        .get('/products/non-existent-id')
        .expect(404);
    });
  });

  describe('PATCH /products/:id', () => {
    it('should update a product', () => {
      return request(app.getHttpServer())
        .patch(`/products/${productId}`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({
          price: 600,
          quantity: 150,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.price).toBe(600);
          expect(res.body.data.quantity).toBe(150);
        });
    });

    it('should reject unauthorized update', () => {
      return request(app.getHttpServer())
        .patch(`/products/${productId}`)
        .send({ price: 700 })
        .expect(401);
    });
  });

  describe('DELETE /products/:id', () => {
    it('should soft delete a product', () => {
      return request(app.getHttpServer())
        .delete(`/products/${productId}`)
        .set('Authorization', `Bearer ${vendorToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });

    it('should not find deleted product', () => {
      return request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(404);
    });
  });
});
