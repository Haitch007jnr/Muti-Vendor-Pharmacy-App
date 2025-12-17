import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Security Tests - SQL Injection Prevention (E2E)', () => {
  let app: INestApplication;

  const sqlInjectionPayloads = [
    "' OR '1'='1",
    "1' OR '1' = '1",
    "' OR 1=1--",
    "admin'--",
    "' UNION SELECT NULL--",
    "1; DROP TABLE users--",
    "'; DROP TABLE products; --",
    "1' AND '1'='1",
    "' OR 'x'='x",
    "1'; EXEC sp_MSForEachTable 'DROP TABLE ?'; --",
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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Login Endpoint SQL Injection Tests', () => {
    it('should prevent SQL injection in email field', async () => {
      for (const payload of sqlInjectionPayloads) {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: payload,
            password: 'test123',
          });

        // Should not return 500 (server error)
        expect(response.status).not.toBe(500);
        
        // Should not expose SQL error messages
        expect(JSON.stringify(response.body)).not.toMatch(/sql/i);
        expect(JSON.stringify(response.body)).not.toMatch(/syntax/i);
        expect(JSON.stringify(response.body)).not.toMatch(/database/i);
        
        // Should return proper error (400 or 401)
        expect([400, 401]).toContain(response.status);
      }
    });

    it('should prevent SQL injection in password field', async () => {
      for (const payload of sqlInjectionPayloads) {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'test@example.com',
            password: payload,
          });

        expect(response.status).not.toBe(500);
        expect(JSON.stringify(response.body)).not.toMatch(/sql/i);
      }
    });
  });

  describe('Product Search SQL Injection Tests', () => {
    it('should prevent SQL injection in search query', async () => {
      for (const payload of sqlInjectionPayloads) {
        const response = await request(app.getHttpServer())
          .get(`/products/search`)
          .query({ q: payload });

        expect(response.status).not.toBe(500);
        expect(JSON.stringify(response.body)).not.toMatch(/sql/i);
        expect(JSON.stringify(response.body)).not.toMatch(/syntax error/i);
      }
    });

    it('should prevent SQL injection in category filter', async () => {
      for (const payload of sqlInjectionPayloads) {
        const response = await request(app.getHttpServer())
          .get('/products')
          .query({ category: payload });

        expect(response.status).not.toBe(500);
        expect(JSON.stringify(response.body)).not.toMatch(/sql/i);
      }
    });
  });

  describe('User Profile SQL Injection Tests', () => {
    let authToken: string;

    beforeAll(async () => {
      // Create test user and get token
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `sqltest-${Date.now()}@example.com`,
          password: 'Test@1234',
          firstName: 'SQL',
          lastName: 'Test',
          phoneNumber: '+2348012345690',
        });

      authToken = registerResponse.body.data?.accessToken;
    });

    it('should prevent SQL injection in profile updates', async () => {
      for (const payload of sqlInjectionPayloads) {
        const response = await request(app.getHttpServer())
          .patch('/users/profile')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            firstName: payload,
            lastName: 'Test',
          });

        expect(response.status).not.toBe(500);
        expect(JSON.stringify(response.body)).not.toMatch(/sql/i);
      }
    });
  });

  describe('Order Query SQL Injection Tests', () => {
    it('should prevent SQL injection in order ID parameter', async () => {
      for (const payload of sqlInjectionPayloads) {
        const response = await request(app.getHttpServer())
          .get(`/orders/${payload}`);

        // Might be 401 (unauthorized), 404 (not found), or 400 (bad request)
        // But should never be 500
        expect(response.status).not.toBe(500);
        expect(JSON.stringify(response.body)).not.toMatch(/sql/i);
      }
    });
  });
});
