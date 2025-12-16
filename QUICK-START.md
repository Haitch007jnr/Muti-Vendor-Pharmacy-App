# Quick Start Guide - Multi-Vendor Pharmacy API

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker & Docker Compose
- PostgreSQL 16 (via Docker)
- Redis 7 (via Docker)

## Quick Setup

```bash
# 1. Clone and navigate to repository
cd /path/to/Muti-Vendor-Pharmacy-App

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# 4. Start services
docker-compose up -d

# 5. Start API in development mode
npm run dev:api
# Or from API directory:
cd apps/api && npm run dev
```

## Access Points

- **API Server**: http://localhost:4000
- **API Documentation**: http://localhost:4000/api/docs
- **Health Check**: http://localhost:4000/api/v1

## Quick Test

### 1. Register a User

```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+2348012345678"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

Copy the `accessToken` from the response.

### 3. Get Current User

```bash
curl -X GET http://localhost:4000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### 4. Initialize Payment

```bash
curl -X POST http://localhost:4000/api/v1/payments/initialize \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "gateway": "paystack",
    "amount": 5000,
    "currency": "NGN",
    "email": "customer@example.com"
  }'
```

## Database Access

```bash
# Access PostgreSQL
docker exec -it pharmacy-db psql -U pharmacy_admin -d pharmacy_platform

# View users
SELECT email, role, status FROM users;

# View roles and permissions
SELECT r.name, COUNT(rp.id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.name;
```

## Common Commands

```bash
# Development
npm run dev              # Start all apps
npm run dev:api          # Start API only

# Build
npm run build            # Build all
npm run build:api        # Build API only
cd apps/api && npm run build  # Alternative

# Lint
npm run lint             # Lint all code

# Test
npm run test             # Run tests
npm run test:coverage    # Test with coverage

# Database
docker-compose up -d postgres    # Start PostgreSQL
docker-compose down              # Stop all services
docker-compose logs -f postgres  # View PostgreSQL logs
```

## Environment Variables

Essential variables in `.env`:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=pharmacy_admin
DATABASE_PASSWORD=pharmacy_secure_pass
DATABASE_NAME=pharmacy_platform

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=7d

# API
API_PORT=4000
NODE_ENV=development

# Paystack
PAYSTACK_SECRET_KEY=sk_test_your_key_here

# Monnify
MONNIFY_API_KEY=your_key_here
MONNIFY_SECRET_KEY=your_secret_here
MONNIFY_CONTRACT_CODE=your_code_here
```

## Project Structure

```
apps/api/src/
├── common/
│   ├── decorators/      # @CurrentUser(), @RequirePermissions()
│   ├── entities/        # TypeORM entities (User, Role, etc.)
│   ├── guards/          # (Future custom guards)
│   └── filters/         # (Future exception filters)
├── modules/
│   ├── auth/           # Authentication & JWT
│   ├── payments/       # Payment gateway abstraction
│   ├── users/          # (Future implementation)
│   ├── vendors/        # (Future implementation)
│   └── ...
├── app.module.ts       # Root module
└── main.ts             # Bootstrap & configuration
```

## Key Patterns

### Protected Endpoints

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { PermissionsGuard } from './auth/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('products')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductsController {
  
  @Post()
  @RequirePermissions('products.create')
  create(@Body() dto: CreateProductDto, @CurrentUser() user: User) {
    // Implementation
  }
}
```

### Adding Payment Gateway

1. Implement `IPaymentGateway` interface
2. Add to `PaymentGateway` enum
3. Register in `PaymentGatewayFactory`
4. Configure environment variables

## Troubleshooting

### Build Fails

```bash
cd apps/api
npm rebuild bcrypt --build-from-source
npm run build
```

### Database Connection Error

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart services
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Permission Denied

Check if user has required role/permissions in database:

```sql
SELECT u.email, r.name as role
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'your@email.com';
```

## Default Credentials (Development Only)

```
Super Admin:
- Email: admin@pharmacy.com
- Password: (See database seed file)

Vendor:
- Email: vendor@pharmacy.com
- Password: (See database seed file)

Customer:
- Email: customer@pharmacy.com
- Password: (See database seed file)
```

⚠️ **Important**: Change these credentials in production!

## Next Steps

1. Explore Swagger UI: http://localhost:4000/api/docs
2. Review `docs/CORE-INFRASTRUCTURE-GUIDE.md`
3. Check `README.md` for full project overview
4. Start implementing business modules

## Support

- **Documentation**: http://localhost:4000/api/docs
- **GitHub Issues**: Repository issues tab
- **Logs**: Check console output for detailed errors

---

Happy coding! 🚀
