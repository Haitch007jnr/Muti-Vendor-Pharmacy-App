# Testing and QA Guide

## Overview

This comprehensive guide outlines the testing strategy, procedures, and best practices for the Multi-Vendor Pharmacy Platform.

## Testing Strategy

### Test Pyramid

```
         /\
        /E2E\          - End-to-End Tests (10%)
       /------\
      /  Integ \       - Integration Tests (30%)
     /----------\
    /    Unit    \     - Unit Tests (60%)
   /--------------\
```

### Coverage Goals

- **Unit Tests:** ≥80% code coverage
- **Integration Tests:** All critical API endpoints
- **E2E Tests:** All major user flows
- **Performance Tests:** All high-traffic endpoints

## Testing Environment Setup

### Prerequisites

```bash
# Install dependencies
npm install

# Set up test database
docker-compose -f docker-compose.test.yml up -d

# Run migrations
npm run migration:run
```

### Environment Variables

Create `.env.test` file:

```env
NODE_ENV=test
DATABASE_URL=postgresql://test_user:test_pass@localhost:5433/pharmacy_test
REDIS_URL=redis://localhost:6380
JWT_SECRET=test-jwt-secret

# Test API keys (use sandbox/test keys)
PAYSTACK_SECRET_KEY=sk_test_xxx
MONNIFY_API_KEY=test_api_key
SENDGRID_API_KEY=test_sendgrid_key
TWILIO_ACCOUNT_SID=test_account_sid
FIREBASE_PROJECT_ID=test-project
```

## Unit Testing

### Backend (NestJS)

#### Running Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run specific test file
npm test payment-gateways.spec.ts

# Run tests matching pattern
npm test -- --testPathPattern=payment
```

#### Example: Service Unit Test

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PaymentTransactionService } from './payment-transaction.service';
import { PaymentGatewayFactory } from './payment-gateway.factory';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let transactionService: PaymentTransactionService;
  let gatewayFactory: PaymentGatewayFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: PaymentTransactionService,
          useValue: {
            createTransaction: jest.fn(),
            updateTransaction: jest.fn(),
            findByReference: jest.fn(),
          },
        },
        {
          provide: PaymentGatewayFactory,
          useValue: {
            getGateway: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    transactionService = module.get<PaymentTransactionService>(PaymentTransactionService);
    gatewayFactory = module.get<PaymentGatewayFactory>(PaymentGatewayFactory);
  });

  describe('initializePayment', () => {
    it('should initialize payment successfully', async () => {
      const mockGateway = {
        initializePayment: jest.fn().mockResolvedValue({
          success: true,
          reference: 'PST-123',
          authorizationUrl: 'https://checkout.paystack.com/xyz',
        }),
      };

      jest.spyOn(gatewayFactory, 'getGateway').mockReturnValue(mockGateway);
      jest.spyOn(transactionService, 'createTransaction').mockResolvedValue({
        id: 'tx-123',
        reference: 'PST-123',
      });

      const result = await service.initializePayment(
        PaymentGateway.PAYSTACK,
        {
          amount: 10000,
          currency: 'NGN',
          email: 'test@example.com',
        },
        'user-123',
        'vendor-123',
        'order-123'
      );

      expect(result.success).toBe(true);
      expect(result.reference).toBe('PST-123');
      expect(transactionService.createTransaction).toHaveBeenCalled();
    });

    it('should handle payment initialization failure', async () => {
      const mockGateway = {
        initializePayment: jest.fn().mockRejectedValue(
          new Error('Gateway error')
        ),
      };

      jest.spyOn(gatewayFactory, 'getGateway').mockReturnValue(mockGateway);

      await expect(
        service.initializePayment(PaymentGateway.PAYSTACK, {
          amount: 10000,
          currency: 'NGN',
          email: 'test@example.com',
        })
      ).rejects.toThrow('Gateway error');
    });
  });
});
```

#### Example: Controller Unit Test

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let service: PaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: {
            initializePayment: jest.fn(),
            verifyPayment: jest.fn(),
            refundPayment: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should initialize payment', async () => {
    const dto = {
      gateway: 'paystack',
      amount: 10000,
      currency: 'NGN',
      email: 'test@example.com',
    };

    const mockResponse = {
      success: true,
      reference: 'PST-123',
      authorizationUrl: 'https://checkout.paystack.com/xyz',
    };

    jest.spyOn(service, 'initializePayment').mockResolvedValue(mockResponse);

    const result = await controller.initializePayment(dto, { user: { id: 'user-123' } });

    expect(result).toEqual(mockResponse);
    expect(service.initializePayment).toHaveBeenCalledWith(
      dto.gateway,
      dto,
      'user-123',
      undefined,
      undefined
    );
  });
});
```

### Frontend (React/Next.js)

```bash
# Run frontend tests
cd apps/web-admin
npm test

# Run with coverage
npm test -- --coverage
```

### Mobile (React Native)

```bash
# Run mobile tests
cd apps/mobile-customer
npm test

# Update snapshots
npm test -- -u
```

## Integration Testing

### API Integration Tests

#### Setup

Create `test/jest-integration.json`:

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".integration-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
```

#### Example: Payment Integration Test

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Payments (Integration)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    authToken = loginResponse.body.data.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /payments/initialize', () => {
    it('should initialize payment successfully', () => {
      return request(app.getHttpServer())
        .post('/payments/initialize')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          gateway: 'paystack',
          amount: 10000,
          currency: 'NGN',
          email: 'customer@example.com',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.reference).toBeDefined();
          expect(res.body.authorizationUrl).toBeDefined();
        });
    });

    it('should reject invalid payment data', () => {
      return request(app.getHttpServer())
        .post('/payments/initialize')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          gateway: 'paystack',
          amount: -1000, // Invalid amount
          currency: 'NGN',
          email: 'invalid-email',
        })
        .expect(400);
    });
  });

  describe('GET /payments/verify', () => {
    it('should verify payment', async () => {
      // First, initialize a payment
      const initResponse = await request(app.getHttpServer())
        .post('/payments/initialize')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          gateway: 'paystack',
          amount: 10000,
          currency: 'NGN',
          email: 'customer@example.com',
        });

      const reference = initResponse.body.reference;

      // Then verify it
      return request(app.getHttpServer())
        .get(`/payments/verify?gateway=paystack&reference=${reference}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});
```

#### Run Integration Tests

```bash
npm run test:e2e
```

## End-to-End Testing

### Using Cypress (Web Apps)

#### Setup

```bash
cd apps/web-admin
npm install --save-dev cypress

# Open Cypress
npx cypress open
```

#### Example E2E Test

```typescript
// cypress/e2e/checkout-flow.cy.ts
describe('Checkout Flow', () => {
  beforeEach(() => {
    // Login
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('customer@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should complete checkout successfully', () => {
    // Browse products
    cy.visit('/products');
    cy.get('[data-testid="product-card"]').first().click();

    // Add to cart
    cy.get('[data-testid="add-to-cart"]').click();
    cy.get('[data-testid="cart-badge"]').should('contain', '1');

    // Go to cart
    cy.get('[data-testid="cart-icon"]').click();
    cy.url().should('include', '/cart');

    // Proceed to checkout
    cy.get('[data-testid="checkout-button"]').click();

    // Fill shipping info
    cy.get('[data-testid="street-input"]').type('123 Main St');
    cy.get('[data-testid="city-input"]').type('Lagos');
    cy.get('[data-testid="state-select"]').select('Lagos');

    // Select payment method
    cy.get('[data-testid="payment-paystack"]').click();

    // Place order
    cy.get('[data-testid="place-order"]').click();

    // Verify redirect to payment gateway
    cy.url().should('include', 'paystack.com');
  });
});
```

### Using Detox (React Native)

#### Setup

```bash
cd apps/mobile-customer
npm install --save-dev detox

# Initialize Detox
npx detox init
```

#### Example Mobile E2E Test

```typescript
// e2e/checkout.e2e.ts
describe('Checkout Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete checkout', async () => {
    // Login
    await element(by.id('email-input')).typeText('customer@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    // Browse products
    await element(by.id('products-tab')).tap();
    await element(by.id('product-item')).atIndex(0).tap();

    // Add to cart
    await element(by.id('add-to-cart')).tap();

    // Go to cart
    await element(by.id('cart-tab')).tap();

    // Checkout
    await element(by.id('checkout-button')).tap();

    // Verify order confirmation
    await expect(element(by.text('Order Placed'))).toBeVisible();
  });
});
```

## Performance Testing

### Load Testing with Artillery

#### Setup

```bash
npm install --save-dev artillery
```

#### Configuration

Create `artillery-config.yml`:

```yaml
config:
  target: 'http://localhost:4000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: Warm up
    - duration: 120
      arrivalRate: 50
      name: Sustained load
    - duration: 60
      arrivalRate: 100
      name: Peak load
  defaults:
    headers:
      Authorization: 'Bearer {{ $processEnvironment.AUTH_TOKEN }}'

scenarios:
  - name: 'Get Products'
    flow:
      - get:
          url: '/api/v1/products?page=1&limit=20'

  - name: 'Initialize Payment'
    flow:
      - post:
          url: '/api/v1/payments/initialize'
          json:
            gateway: 'paystack'
            amount: 10000
            currency: 'NGN'
            email: 'test@example.com'
```

#### Run Load Tests

```bash
AUTH_TOKEN=your-token artillery run artillery-config.yml
```

### Stress Testing

```yaml
config:
  target: 'http://localhost:4000'
  phases:
    - duration: 300
      arrivalRate: 200
      rampTo: 500
      name: Ramp up to breaking point
```

## Security Testing

### OWASP Dependency Check

```bash
# Install dependency-check
npm install --save-dev @cyclonedx/cyclonedx-npm

# Generate SBOM
npm run cyclonedx-npm

# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### Manual Security Checks

- [ ] SQL Injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Authentication bypass attempts
- [ ] Authorization bypass attempts
- [ ] Rate limiting effectiveness
- [ ] Input validation
- [ ] Error message information disclosure
- [ ] API key exposure in logs

## QA Test Checklist

### Payment Integration

- [ ] Initialize payment with Paystack
- [ ] Initialize payment with Monnify
- [ ] Verify successful payment
- [ ] Verify failed payment
- [ ] Handle payment timeout
- [ ] Process refund
- [ ] Verify webhook signature
- [ ] Handle duplicate webhook
- [ ] Test payment reconciliation
- [ ] Test with various amounts
- [ ] Test with different currencies

### Push Notifications

- [ ] Send email notification
- [ ] Send SMS notification
- [ ] Send push notification
- [ ] Test notification templates
- [ ] Test variable substitution
- [ ] Test notification scheduling
- [ ] Test batch notifications
- [ ] Verify delivery status
- [ ] Test deep linking from notification
- [ ] Test on iOS device
- [ ] Test on Android device

### API Endpoints

- [ ] Test authentication
- [ ] Test token refresh
- [ ] Test rate limiting
- [ ] Test pagination
- [ ] Test filtering
- [ ] Test sorting
- [ ] Test search functionality
- [ ] Test error handling
- [ ] Test validation errors
- [ ] Test CORS

### Mobile Apps

- [ ] Test app installation
- [ ] Test user registration
- [ ] Test login/logout
- [ ] Test product browsing
- [ ] Test search functionality
- [ ] Test cart management
- [ ] Test checkout flow
- [ ] Test payment integration
- [ ] Test order tracking
- [ ] Test push notifications
- [ ] Test offline functionality
- [ ] Test app updates

### Cross-Platform Testing

- [ ] Test on iOS (latest version)
- [ ] Test on iOS (previous version)
- [ ] Test on Android (latest version)
- [ ] Test on Android (previous version)
- [ ] Test on tablets
- [ ] Test on various screen sizes
- [ ] Test in portrait orientation
- [ ] Test in landscape orientation

## Test Automation

### CI/CD Integration

`.github/workflows/tests.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:e2e

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx cypress run
```

## Reporting

### Test Coverage Report

```bash
# Generate coverage report
npm run test:cov

# View HTML report
open coverage/lcov-report/index.html
```

### Test Results

Test results are generated in JUnit XML format for CI integration:

```bash
npm test -- --ci --reporters=default --reporters=jest-junit
```

## Best Practices

1. **Write tests first** (TDD approach when possible)
2. **Keep tests isolated** - No dependencies between tests
3. **Use descriptive names** - Test names should explain what is being tested
4. **Mock external dependencies** - Don't make real API calls in unit tests
5. **Test edge cases** - Not just happy paths
6. **Keep tests fast** - Unit tests should run in milliseconds
7. **Clean up after tests** - Always restore state
8. **Use factories** for test data creation
9. **Avoid test duplication** - Use setup/teardown functions
10. **Document complex tests** - Add comments explaining why

## Continuous Improvement

- Review test coverage weekly
- Add tests for reported bugs
- Update tests when features change
- Remove obsolete tests
- Refactor duplicated test code
- Monitor test execution time
- Analyze flaky tests

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Cypress Documentation](https://docs.cypress.io/)
- [Detox Documentation](https://wix.github.io/Detox/)
- [Artillery Documentation](https://www.artillery.io/docs)

## Support

For testing questions or issues:
- Email: qa@pharmacy.com
- Slack: #qa-testing
- Documentation: https://docs.pharmacy.com/testing
