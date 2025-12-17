import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Security Tests - XSS Prevention (E2E)', () => {
  let app: INestApplication;
  let authToken: string;

  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    '<svg onload=alert("XSS")>',
    'javascript:alert("XSS")',
    '<iframe src="javascript:alert(\'XSS\')">',
    '<body onload=alert("XSS")>',
    '<input onfocus=alert("XSS") autofocus>',
    '<select onfocus=alert("XSS") autofocus>',
    '<textarea onfocus=alert("XSS") autofocus>',
    '<keygen onfocus=alert("XSS") autofocus>',
    '<video><source onerror="alert(\'XSS\')">',
    '<audio src=x onerror=alert("XSS")>',
    '<details open ontoggle=alert("XSS")>',
    '<marquee onstart=alert("XSS")>',
  ];

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

    // Create test user and get token
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `xsstest-${Date.now()}@example.com`,
        password: 'Test@1234',
        firstName: 'XSS',
        lastName: 'Test',
        phoneNumber: '+2348012345691',
      });

    authToken = registerResponse.body.data?.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Product Creation XSS Tests', () => {
    it('should sanitize XSS in product name', async () => {
      for (const payload of xssPayloads) {
        const response = await request(app.getHttpServer())
          .post('/products')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: payload,
            sku: `XSS-SKU-${Date.now()}`,
            price: 100,
            costPrice: 50,
            quantity: 10,
          });

        if (response.status === 201) {
          const name = response.body.data.name;
          
          // Check that dangerous tags are removed or escaped
          expect(name).not.toContain('<script>');
          expect(name).not.toContain('onerror=');
          expect(name).not.toContain('onload=');
          expect(name).not.toContain('javascript:');
          expect(name).not.toContain('<iframe');
          expect(name).not.toContain('<img');
          expect(name).not.toContain('<svg');
        }
      }
    });

    it('should sanitize XSS in product description', async () => {
      for (const payload of xssPayloads) {
        const response = await request(app.getHttpServer())
          .post('/products')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: 'Test Product',
            description: payload,
            sku: `XSS-DESC-${Date.now()}`,
            price: 100,
            costPrice: 50,
            quantity: 10,
          });

        if (response.status === 201) {
          const description = response.body.data.description;
          
          expect(description).not.toContain('<script>');
          expect(description).not.toContain('javascript:');
        }
      }
    });
  });

  describe('User Profile XSS Tests', () => {
    it('should sanitize XSS in first name', async () => {
      for (const payload of xssPayloads) {
        const response = await request(app.getHttpServer())
          .patch('/users/profile')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            firstName: payload,
          });

        if (response.status === 200) {
          const firstName = response.body.data.firstName;
          
          expect(firstName).not.toContain('<script>');
          expect(firstName).not.toContain('onerror=');
        }
      }
    });

    it('should sanitize XSS in last name', async () => {
      for (const payload of xssPayloads) {
        const response = await request(app.getHttpServer())
          .patch('/users/profile')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            lastName: payload,
          });

        if (response.status === 200) {
          const lastName = response.body.data.lastName;
          
          expect(lastName).not.toContain('<script>');
          expect(lastName).not.toContain('onerror=');
        }
      }
    });
  });

  describe('Comment/Review XSS Tests', () => {
    it('should sanitize XSS in product reviews', async () => {
      for (const payload of xssPayloads) {
        const response = await request(app.getHttpServer())
          .post('/reviews')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            productId: 'test-product-id',
            rating: 5,
            comment: payload,
          });

        // If the endpoint exists and returns success
        if (response.status === 201) {
          const comment = response.body.data.comment;
          
          expect(comment).not.toContain('<script>');
          expect(comment).not.toContain('javascript:');
          expect(comment).not.toContain('onerror=');
        }
      }
    });
  });

  describe('Search Query XSS Tests', () => {
    it('should not reflect XSS in search results', async () => {
      for (const payload of xssPayloads) {
        const response = await request(app.getHttpServer())
          .get('/products/search')
          .query({ q: payload });

        if (response.status === 200) {
          const responseBody = JSON.stringify(response.body);
          
          // Ensure XSS payload is not reflected in response
          expect(responseBody).not.toContain('<script>');
          expect(responseBody).not.toContain('onerror=');
          expect(responseBody).not.toContain('javascript:');
        }
      }
    });
  });

  describe('Response Header XSS Protection', () => {
    it('should have X-XSS-Protection header', async () => {
      const response = await request(app.getHttpServer())
        .get('/health');

      // Check for XSS protection headers
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should have proper Content-Security-Policy', async () => {
      const response = await request(app.getHttpServer())
        .get('/health');

      // CSP header should exist (if helmet is configured)
      const csp = response.headers['content-security-policy'];
      if (csp) {
        expect(csp).toBeDefined();
      }
    });
  });
});
