import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Authentication (E2E)', () => {
  let app: INestApplication;
  let authToken: string;

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

  describe('POST /auth/register', () => {
    it('should register a new user successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `test-${Date.now()}@example.com`,
          password: 'Test@1234',
          firstName: 'Test',
          lastName: 'User',
          phoneNumber: '+2348012345678',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('user');
          expect(res.body.data).toHaveProperty('accessToken');
          expect(res.body.data.user).toHaveProperty('email');
        });
    });

    it('should reject registration with invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Test@1234',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(400);
    });

    it('should reject registration with weak password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: '123',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(400);
    });

    it('should reject registration with duplicate email', async () => {
      const email = `duplicate-${Date.now()}@example.com`;
      
      // First registration
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password: 'Test@1234',
          firstName: 'Test',
          lastName: 'User',
          phoneNumber: '+2348012345678',
        })
        .expect(201);

      // Duplicate registration
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password: 'Test@1234',
          firstName: 'Test',
          lastName: 'User',
          phoneNumber: '+2348012345679',
        })
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    beforeAll(async () => {
      // Register a test user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'login-test@example.com',
          password: 'Test@1234',
          firstName: 'Login',
          lastName: 'Test',
          phoneNumber: '+2348012345680',
        });
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login-test@example.com',
          password: 'Test@1234',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data).toHaveProperty('user');

      authToken = response.body.data.accessToken;
    });

    it('should reject login with invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test@1234',
        })
        .expect(401);
    });

    it('should reject login with invalid password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login-test@example.com',
          password: 'WrongPassword@123',
        })
        .expect(401);
    });
  });

  describe('GET /auth/profile', () => {
    it('should get user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('email');
          expect(res.body.data).toHaveProperty('firstName');
          expect(res.body.data).toHaveProperty('lastName');
        });
    });

    it('should reject request without token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('should reject request with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('POST /auth/refresh', () => {
    let refreshToken: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login-test@example.com',
          password: 'Test@1234',
        });

      refreshToken = response.body.data.refreshToken;
    });

    it('should refresh token successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('accessToken');
          expect(res.body.data).toHaveProperty('refreshToken');
        });
    });

    it('should reject invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-refresh-token' })
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });
  });
});
