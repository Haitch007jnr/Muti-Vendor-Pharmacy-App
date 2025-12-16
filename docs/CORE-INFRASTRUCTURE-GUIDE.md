# Core Infrastructure Implementation Guide

## Overview

This document outlines the implementation of the core infrastructure for the Multi-Vendor Pharmacy Platform, including:

1. **Enhanced Database Schema with Dynamic RBAC**
2. **JWT-based Authentication & Authorization**
3. **Payment Gateway Abstraction Layer**
4. **API Service Layer Structure**

---

## 1. Database Schema Design

### Multi-Tenant & RBAC Tables

#### New Tables Added:

1. **roles** - Stores system and custom roles
   - System roles (super_admin, admin, vendor, etc.)
   - Custom vendor-specific roles
   - Supports multi-tenancy via `vendor_id`

2. **permissions** - Granular permission definitions
   - Resource-based permissions (e.g., users.create, products.read)
   - Action-based access control

3. **role_permissions** - Many-to-many mapping
   - Links roles to permissions
   - Enables flexible permission assignment

4. **user_roles** - User role assignments
   - Multi-role support per user
   - Vendor-scoped role assignments
   - Optional expiration dates

5. **activity_logs** - Audit trail
   - Tracks all user actions
   - Records IP address and user agent
   - Stores metadata in JSONB format

6. **api_keys** - API key management
   - Vendor API integrations
   - Permission scoping
   - Expiration and status tracking

### Running Database Migrations

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Database will be initialized automatically with schema and seed data
# Or manually run:
psql -h localhost -U pharmacy_admin -d pharmacy_platform -f database/init/01-schema.sql
psql -h localhost -U pharmacy_admin -d pharmacy_platform -f database/init/02-seed.sql
```

---

## 2. Authentication & Authorization

### JWT Authentication

The system implements JWT-based authentication with the following features:

#### Key Components:

1. **AuthService** (`apps/api/src/modules/auth/auth.service.ts`)
   - User registration with password hashing
   - Login with credentials validation
   - Token generation (access + refresh)
   - Password change functionality

2. **JwtStrategy** (`apps/api/src/modules/auth/strategies/jwt.strategy.ts`)
   - Validates JWT tokens
   - Loads user with roles and permissions
   - Checks user status

3. **Guards**
   - `JwtAuthGuard` - Validates JWT tokens
   - `PermissionsGuard` - Checks user permissions

4. **Decorators**
   - `@CurrentUser()` - Injects authenticated user
   - `@RequirePermissions(...)` - Requires specific permissions

### API Endpoints

```typescript
// Register a new user
POST /api/v1/auth/register
Body: {
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+2348012345678",
  "role": "customer"  // Optional, defaults to customer
}

// Login
POST /api/v1/auth/login
Body: {
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
Response: {
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}

// Refresh token
POST /api/v1/auth/refresh
Body: {
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

// Get current user
GET /api/v1/auth/me
Headers: {
  "Authorization": "Bearer <access_token>"
}
```

### Using RBAC in Controllers

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('products')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductsController {
  
  @Post()
  @RequirePermissions('products.create')
  async createProduct(
    @Body() dto: CreateProductDto,
    @CurrentUser() user: User,
  ) {
    // Only users with 'products.create' permission can access this
    return this.productsService.create(dto, user.id);
  }

  @Get()
  @RequirePermissions('products.read')
  async listProducts() {
    // Requires 'products.read' permission
    return this.productsService.findAll();
  }
}
```

### Default Roles and Permissions

System roles are automatically seeded with these permissions:

- **super_admin**: All permissions
- **admin**: Users, vendors, products, orders, payments, inventory, reports
- **vendor**: Products, orders, inventory (create, read, update)
- **customer**: Products (read), orders (create, read)
- **delivery**: Orders (read, update)

---

## 3. Payment Gateway Abstraction Layer

### Architecture

The payment system uses a **Strategy Pattern** with a factory to support multiple payment gateways:

```
PaymentGatewayFactory
  ├── PaystackService (implements IPaymentGateway)
  └── MonnifyService (implements IPaymentGateway)
```

### Key Features

1. **Gateway-agnostic interface**
2. **Easy to add new gateways**
3. **Consistent API across gateways**
4. **Webhook handling support**
5. **Automatic reference generation**

### Implementation

#### Payment Gateway Interface

```typescript
export interface IPaymentGateway {
  initializePayment(request: InitializePaymentRequest): Promise<InitializePaymentResponse>;
  verifyPayment(reference: string): Promise<VerifyPaymentResponse>;
  refundPayment(request: RefundPaymentRequest): Promise<RefundPaymentResponse>;
  handleWebhook(payload: PaymentWebhookPayload): Promise<void>;
}
```

#### Supported Gateways

1. **Paystack**
   - Card payments
   - Bank transfers
   - USSD
   - Mobile money

2. **Monnify**
   - Card payments
   - Bank transfers
   - Account transfers

### API Endpoints

```typescript
// Initialize payment
POST /api/v1/payments/initialize
Headers: {
  "Authorization": "Bearer <access_token>"
}
Body: {
  "gateway": "paystack",  // or "monnify"
  "amount": 10000,
  "currency": "NGN",
  "email": "customer@example.com",
  "metadata": {
    "orderId": "ORDER-123",
    "customerId": "uuid"
  },
  "callbackUrl": "https://yourapp.com/payment/callback"
}
Response: {
  "success": true,
  "reference": "PST-1234567890-ABC123",
  "authorizationUrl": "https://checkout.paystack.com/..."
}

// Verify payment
GET /api/v1/payments/verify?gateway=paystack&reference=PST-1234567890-ABC123
Headers: {
  "Authorization": "Bearer <access_token>"
}
Response: {
  "success": true,
  "reference": "PST-1234567890-ABC123",
  "amount": 10000,
  "currency": "NGN",
  "status": "completed",
  "paidAt": "2025-12-16T22:30:00Z",
  "metadata": { ... }
}
```

### Environment Configuration

```env
# Paystack
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key

# Monnify
MONNIFY_API_KEY=your_monnify_api_key
MONNIFY_SECRET_KEY=your_monnify_secret_key
MONNIFY_CONTRACT_CODE=your_monnify_contract_code
MONNIFY_BASE_URL=https://sandbox.monnify.com
```

### Adding a New Payment Gateway

1. Create a new service implementing `IPaymentGateway`:

```typescript
@Injectable()
export class FlutterwaveService implements IPaymentGateway {
  async initializePayment(request: InitializePaymentRequest) {
    // Implementation
  }
  // ... implement other methods
}
```

2. Register in `PaymentGatewayFactory`:

```typescript
export enum PaymentGateway {
  PAYSTACK = 'paystack',
  MONNIFY = 'monnify',
  FLUTTERWAVE = 'flutterwave',  // Add here
}

@Injectable()
export class PaymentGatewayFactory {
  constructor(
    private readonly paystackService: PaystackService,
    private readonly monnifyService: MonnifyService,
    private readonly flutterwaveService: FlutterwaveService,  // Inject
  ) {}

  getGateway(gateway: PaymentGateway): IPaymentGateway {
    switch (gateway) {
      case PaymentGateway.PAYSTACK:
        return this.paystackService;
      case PaymentGateway.MONNIFY:
        return this.monnifyService;
      case PaymentGateway.FLUTTERWAVE:
        return this.flutterwaveService;  // Add case
      default:
        throw new BadRequestException(`Unsupported gateway: ${gateway}`);
    }
  }
}
```

---

## 4. API Service Layer Structure

### Global Configuration

The API is configured in `main.ts` with:

- **Global prefix**: `/api/v1`
- **Validation pipe**: Automatic DTO validation
- **Security headers**: Helmet.js
- **Compression**: Response compression
- **CORS**: Enabled for cross-origin requests
- **Swagger**: API documentation at `/api/docs`

### Global Pipes and Filters

```typescript
// Validation pipe (already configured in main.ts)
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

### Error Handling

NestJS automatically handles errors and returns structured responses:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

---

## 5. Development Workflow

### Starting the Development Environment

```bash
# Install dependencies
npm install

# Start PostgreSQL and Redis
docker-compose up -d

# Start API in development mode
npm run dev:api

# Or start from API directory
cd apps/api
npm run dev
```

### Building for Production

```bash
# Build all apps
npm run build

# Or build API only
cd apps/api
npm run build
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run e2e tests
npm run test:e2e
```

---

## 6. Swagger API Documentation

Access the interactive API documentation at:

```
http://localhost:4000/api/docs
```

Features:
- Interactive API testing
- Request/response schemas
- Authentication support (Bearer token)
- Example requests

To authenticate:
1. Click "Authorize" button
2. Enter your JWT token
3. Test protected endpoints

---

## 7. Security Best Practices

### Implemented:

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Tokens**: Secure token generation
3. **HTTPS Required**: In production
4. **CORS Configuration**: Restricted origins
5. **Rate Limiting**: Via ThrottlerModule
6. **Input Validation**: class-validator
7. **SQL Injection Prevention**: TypeORM parameterized queries
8. **XSS Protection**: Helmet.js

### Recommendations:

1. Use environment-specific secrets
2. Rotate JWT secrets regularly
3. Implement refresh token rotation
4. Add 2FA for sensitive operations
5. Monitor activity logs
6. Implement IP whitelisting for admin
7. Use HTTPS in production
8. Set secure cookie flags

---

## 8. Testing the Implementation

### Test Authentication

```bash
# Register a user
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# Use the returned token
export TOKEN="your_access_token_here"

# Get current user
curl -X GET http://localhost:4000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Test Payment Gateway

```bash
# Initialize payment
curl -X POST http://localhost:4000/api/v1/payments/initialize \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "gateway": "paystack",
    "amount": 5000,
    "currency": "NGN",
    "email": "customer@example.com"
  }'

# Verify payment
curl -X GET "http://localhost:4000/api/v1/payments/verify?gateway=paystack&reference=PST-123456" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 9. Troubleshooting

### Build Errors

If you encounter build errors with bcrypt:

```bash
# Rebuild bcrypt
cd apps/api
npm rebuild bcrypt --build-from-source
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check connection
psql -h localhost -U pharmacy_admin -d pharmacy_platform

# Reset database
docker-compose down -v
docker-compose up -d
```

### Permission Denied Errors

Make sure the user has the required permissions seeded in the database. Check:

```sql
-- Check user roles
SELECT u.email, r.name as role_name
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id;

-- Check role permissions
SELECT r.name as role, p.name as permission
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
ORDER BY r.name, p.name;
```

---

## 10. Next Steps

1. **Implement remaining modules** (users, vendors, products, orders, etc.)
2. **Add unit and integration tests**
3. **Set up CI/CD pipelines**
4. **Configure production environment**
5. **Implement webhook handlers for payment gateways**
6. **Add email verification flow**
7. **Implement password reset flow**
8. **Add rate limiting per user**
9. **Set up monitoring and logging**
10. **Create frontend applications**

---

## Support

For issues or questions:
- Check the Swagger documentation: http://localhost:4000/api/docs
- Review the code in `apps/api/src`
- Check environment variables in `.env`
- Review logs in the console

---

**Last Updated**: December 16, 2025
