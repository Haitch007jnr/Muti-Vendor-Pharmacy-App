# Multi-Vendor Pharmacy Platform - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Client Applications                         │
├─────────────────────────────────────────────────────────────────────┤
│  Web Admin Portal  │  Web Vendor Portal  │  Mobile Apps (Customer,  │
│    (Next.js)       │     (Next.js)       │   Vendor, Delivery)      │
└──────────────┬──────────────┬────────────────────┬──────────────────┘
               │              │                    │
               └──────────────┴────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          API Gateway                                 │
│                       (NestJS + Express)                            │
├─────────────────────────────────────────────────────────────────────┤
│  • Rate Limiting (Throttler)                                        │
│  • CORS & Security Headers (Helmet)                                 │
│  • Request Validation (class-validator)                             │
│  • Global Exception Handling                                        │
│  • JWT Authentication                                                │
└──────────────┬──────────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Service Layer (NestJS)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ Auth Module  │  │Payment Module│  │ User Module  │             │
│  │              │  │              │  │              │             │
│  │• JWT Auth    │  │• Paystack    │  │• CRUD Ops    │             │
│  │• RBAC        │  │• Monnify     │  │• Profile Mgmt│             │
│  │• Permissions │  │• Verification│  │• Roles       │   + 10 More │
│  └──────────────┘  └──────────────┘  └──────────────┘   Modules   │
│                                                                      │
└──────────────┬──────────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Data Access Layer                              │
├─────────────────────────────────────────────────────────────────────┤
│                        TypeORM                                       │
│  • Entity Management                                                 │
│  • Query Builder                                                     │
│  • Migrations                                                        │
│  • Transactions                                                      │
└──────────────┬──────────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Data Storage                                   │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ PostgreSQL   │  │    Redis     │  │   AWS S3     │             │
│  │              │  │              │  │              │             │
│  │• Primary DB  │  │• Caching     │  │• File Storage│             │
│  │• RBAC Tables │  │• Sessions    │  │• Images      │             │
│  │• Transactions│  │• Rate Limits │  │• Documents   │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    External Services                                │
├─────────────────────────────────────────────────────────────────────┤
│  • Paystack (Payment Gateway)                                        │
│  • Monnify (Payment Gateway)                                         │
│  • SendGrid (Email Service)                                          │
│  • Twilio (SMS Service)                                              │
│  • Firebase (Push Notifications)                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌──────────┐                    ┌──────────┐                 ┌──────────┐
│  Client  │                    │   API    │                 │ Database │
└────┬─────┘                    └────┬─────┘                 └────┬─────┘
     │                               │                            │
     │  POST /auth/register          │                            │
     │─────────────────────────────▶ │                            │
     │                               │  Hash password             │
     │                               │  Create user               │
     │                               │───────────────────────────▶│
     │                               │                            │
     │                               │◀───────────────────────────│
     │                               │  Generate JWT tokens       │
     │  {accessToken, refreshToken}  │                            │
     │◀───────────────────────────── │                            │
     │                               │                            │
     │  POST /auth/login             │                            │
     │─────────────────────────────▶ │                            │
     │                               │  Validate credentials      │
     │                               │───────────────────────────▶│
     │                               │                            │
     │                               │◀───────────────────────────│
     │                               │  Generate JWT tokens       │
     │  {accessToken, refreshToken}  │                            │
     │◀───────────────────────────── │                            │
     │                               │                            │
     │  GET /auth/me                 │                            │
     │  Authorization: Bearer token  │                            │
     │─────────────────────────────▶ │                            │
     │                               │  Verify JWT                │
     │                               │  Load user + permissions   │
     │                               │───────────────────────────▶│
     │                               │                            │
     │                               │◀───────────────────────────│
     │  {user with roles & perms}    │                            │
     │◀───────────────────────────── │                            │
     │                               │                            │
```

## RBAC Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        RBAC System                                   │
└─────────────────────────────────────────────────────────────────────┘

              ┌──────────────┐
              │    Users     │
              │──────────────│
              │ id           │
              │ email        │
              │ role (enum)  │
              └──────┬───────┘
                     │
                     │ Many-to-Many
                     │
              ┌──────▼───────┐
              │  User_Roles  │
              │──────────────│
              │ user_id      │
              │ role_id      │
              │ vendor_id    │◀──────┐
              │ expires_at   │       │
              └──────┬───────┘       │
                     │               │
                     │ Many-to-One   │ Multi-Tenant
                     │               │ Scoping
              ┌──────▼───────┐       │
              │    Roles     │       │
              │──────────────│       │
              │ id           │       │
              │ name         │       │
              │ vendor_id    │───────┘
              │ is_system    │
              └──────┬───────┘
                     │
                     │ Many-to-Many
                     │
              ┌──────▼───────────┐
              │ Role_Permissions │
              │──────────────────│
              │ role_id          │
              │ permission_id    │
              └──────┬───────────┘
                     │
                     │ Many-to-One
                     │
              ┌──────▼────────┐
              │  Permissions  │
              │───────────────│
              │ id            │
              │ name          │
              │ resource      │
              │ action        │
              └───────────────┘

Permission Format: {resource}.{action}
Examples:
  • products.create
  • orders.read
  • users.delete
  • payments.refund
```

## Payment Gateway Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Payment Gateway Abstraction                       │
└─────────────────────────────────────────────────────────────────────┘

                      ┌────────────────────┐
                      │ PaymentsController │
                      └─────────┬──────────┘
                                │
                                │
                      ┌─────────▼──────────┐
                      │  PaymentsService   │
                      └─────────┬──────────┘
                                │
                                │
                      ┌─────────▼──────────────┐
                      │ PaymentGatewayFactory  │
                      │                        │
                      │  getGateway(type)      │
                      └─────────┬──────────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
      ┌─────────▼─────────┐         ┌─────────▼─────────┐
      │  PaystackService  │         │  MonnifyService   │
      │                   │         │                   │
      │ implements        │         │ implements        │
      │ IPaymentGateway   │         │ IPaymentGateway   │
      └─────────┬─────────┘         └─────────┬─────────┘
                │                             │
                │                             │
      ┌─────────▼─────────┐         ┌─────────▼─────────┐
      │  Paystack API     │         │  Monnify API      │
      │  (External)       │         │  (External)       │
      └───────────────────┘         └───────────────────┘

IPaymentGateway Interface:
  • initializePayment()
  • verifyPayment()
  • refundPayment()
  • handleWebhook()

Adding New Gateway:
1. Implement IPaymentGateway
2. Add to PaymentGateway enum
3. Register in Factory
4. Configure environment
```

## Database Schema (RBAC Focus)

```sql
-- Core RBAC Tables

┌──────────────────┐
│      users       │
├──────────────────┤
│ id (UUID) PK     │
│ email            │
│ password_hash    │
│ role (enum)      │  ← Basic role for simple checks
│ status           │
│ ...              │
└────────┬─────────┘
         │
         │ Has Many
         │
┌────────▼─────────┐
│   user_roles     │  ← Flexible role assignment
├──────────────────┤
│ id (UUID) PK     │
│ user_id FK       │
│ role_id FK       │
│ vendor_id FK     │  ← Multi-tenant scope
│ expires_at       │  ← Temporary roles
└────────┬─────────┘
         │
         │ Belongs To
         │
┌────────▼─────────┐
│      roles       │
├──────────────────┤
│ id (UUID) PK     │
│ name UNIQUE      │
│ display_name     │
│ is_system        │  ← System vs Custom roles
│ vendor_id FK     │  ← Vendor-specific roles
└────────┬─────────┘
         │
         │ Has Many
         │
┌────────▼──────────┐
│ role_permissions  │
├───────────────────┤
│ id (UUID) PK      │
│ role_id FK        │
│ permission_id FK  │
└────────┬──────────┘
         │
         │ Belongs To
         │
┌────────▼─────────┐
│   permissions    │
├──────────────────┤
│ id (UUID) PK     │
│ name UNIQUE      │
│ resource         │
│ action           │
│ description      │
└──────────────────┘

-- Audit Trail

┌──────────────────┐
│  activity_logs   │
├──────────────────┤
│ id (UUID) PK     │
│ user_id FK       │
│ vendor_id FK     │
│ action           │
│ resource         │
│ resource_id      │
│ ip_address       │
│ user_agent       │
│ metadata (JSONB) │
│ created_at       │
└──────────────────┘
```

## Request Flow with RBAC

```
1. Client Request
   ├─▶ Headers: Authorization: Bearer <JWT>
   └─▶ Body: Request Data

2. API Gateway
   ├─▶ Rate Limiting Check
   ├─▶ CORS Validation
   └─▶ Security Headers

3. JWT Auth Guard
   ├─▶ Extract JWT Token
   ├─▶ Verify Token Signature
   ├─▶ Check Token Expiration
   ├─▶ Load User from Database
   │   ├─▶ Include user_roles
   │   ├─▶ Include roles
   │   ├─▶ Include role_permissions
   │   └─▶ Include permissions
   └─▶ Attach User to Request

4. Permissions Guard
   ├─▶ Get Required Permissions from @RequirePermissions()
   ├─▶ Extract User Permissions from User object
   ├─▶ Check if User has Required Permission(s)
   ├─▶ Allow if Match
   └─▶ Deny with 403 if No Match

5. Controller Method
   ├─▶ Access @CurrentUser() decorator for user info
   ├─▶ Validate Request DTO
   └─▶ Execute Business Logic

6. Service Layer
   ├─▶ Business Logic
   ├─▶ Database Operations
   └─▶ External API Calls

7. Response
   ├─▶ Transform Data
   ├─▶ Remove Sensitive Fields
   └─▶ Return to Client
```

## Multi-Tenant Architecture

```
Tenant Isolation Strategies:

1. Database Level (Implemented)
   ├─▶ vendor_id in relevant tables
   ├─▶ Automatic filtering by vendor context
   └─▶ Row-level security

2. Application Level
   ├─▶ @CurrentUser() provides vendor context
   ├─▶ Services filter by vendor_id
   └─▶ Guards enforce tenant boundaries

3. API Key Level
   ├─▶ api_keys table with vendor_id
   ├─▶ Scoped permissions per key
   └─▶ Rate limiting per vendor

Example Query with Multi-Tenancy:

// Without tenant context (Super Admin)
const products = await this.productRepo.find();

// With tenant context (Vendor)
const products = await this.productRepo.find({
  where: { vendorId: user.vendorId }
});

// Using QueryBuilder with dynamic tenant
const products = await this.productRepo
  .createQueryBuilder('product')
  .where('product.vendorId = :vendorId', { 
    vendorId: user.vendorId 
  })
  .getMany();
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Production Setup                            │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   Clients    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Load Balancer│  (AWS ALB / Nginx)
└──────┬───────┘
       │
       ├─────────────────┬─────────────────┐
       │                 │                 │
       ▼                 ▼                 ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  API Node 1 │   │  API Node 2 │   │  API Node 3 │
└──────┬──────┘   └──────┬──────┘   └──────┬──────┘
       │                 │                 │
       └─────────────────┴─────────────────┘
                         │
       ┌─────────────────┴─────────────────┐
       │                                   │
       ▼                                   ▼
┌─────────────┐                    ┌─────────────┐
│ PostgreSQL  │                    │    Redis    │
│   Primary   │                    │   Cluster   │
│             │                    │             │
│   Replica   │                    └─────────────┘
└─────────────┘

External Services:
├─▶ AWS S3 (File Storage)
├─▶ SendGrid (Email)
├─▶ Twilio (SMS)
├─▶ Firebase (Push)
├─▶ Paystack (Payments)
└─▶ Monnify (Payments)

Monitoring:
├─▶ CloudWatch / Datadog
├─▶ Sentry (Error Tracking)
└─▶ LogDNA / ELK Stack
```

## Key Design Decisions

### 1. Dynamic RBAC
- **Why**: Flexibility for different vendor needs
- **How**: Database-driven permissions, not hardcoded
- **Benefit**: Vendors can create custom roles

### 2. Strategy Pattern for Payments
- **Why**: Support multiple gateways without coupling
- **How**: Common interface, factory pattern
- **Benefit**: Easy to add new payment providers

### 3. Multi-Tenancy via vendor_id
- **Why**: Data isolation between vendors
- **How**: Foreign key + application-level filtering
- **Benefit**: Single database, isolated data

### 4. JWT with Refresh Tokens
- **Why**: Balance security and UX
- **How**: Short-lived access, long-lived refresh
- **Benefit**: Better security without constant re-login

### 5. TypeORM for Data Access
- **Why**: Type safety, migrations, relationships
- **How**: Entity-based ORM with decorators
- **Benefit**: Type-safe database operations

---

**Last Updated**: December 16, 2025
