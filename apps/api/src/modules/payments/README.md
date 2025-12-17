# Payment Gateway Integration - README

## Overview

This module provides a comprehensive payment gateway integration for the Multi-Vendor Pharmacy Platform, supporting both **Paystack** and **Monnify** payment gateways for web and mobile applications.

## Features

✅ **Multiple Payment Gateways**
- Paystack integration (Nigeria)
- Monnify integration (Nigeria)
- Easy to extend for additional gateways

✅ **Complete Payment Flow**
- Payment initialization
- Payment verification
- Refund processing
- Payment reconciliation

✅ **Webhook Support**
- Real-time payment notifications
- Signature verification for security
- Automatic transaction updates
- Idempotent webhook handling

✅ **Transaction Management**
- Persistent transaction storage
- Payment status tracking
- Webhook attempt tracking
- Reconciliation tracking

✅ **Reporting & Analytics**
- Payment statistics
- Transaction listing
- Filter by gateway, status, vendor
- Reconciliation reports

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Payments Module                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Controllers                                             │
│  ├── PaymentsController (Main API endpoints)            │
│  └── Webhook endpoints (Paystack & Monnify)             │
│                                                          │
│  Services                                                │
│  ├── PaymentsService (Business logic)                   │
│  ├── PaymentTransactionService (Database operations)    │
│  ├── WebhookService (Webhook handling)                  │
│  └── PaymentGatewayFactory (Gateway selection)          │
│                                                          │
│  Gateways                                                │
│  ├── PaystackService (Paystack integration)             │
│  └── MonnifyService (Monnify integration)               │
│                                                          │
│  Entities                                                │
│  └── PaymentTransaction (Database model)                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## API Endpoints

### Authentication Required

All endpoints except webhooks require JWT authentication and appropriate permissions.

#### Initialize Payment

```http
POST /payments/initialize
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "gateway": "paystack",
  "amount": 10000,
  "currency": "NGN",
  "email": "customer@example.com",
  "reference": "optional-reference",
  "metadata": {
    "orderId": "uuid",
    "customerId": "uuid"
  },
  "callbackUrl": "https://your-app.com/callback"
}

Response:
{
  "success": true,
  "reference": "PST-1234567890-ABC123",
  "authorizationUrl": "https://checkout.paystack.com/xyz",
  "accessCode": "xyz"
}
```

#### Verify Payment

```http
GET /payments/verify?gateway=paystack&reference=PST-1234567890-ABC123
Authorization: Bearer <jwt-token>

Response:
{
  "success": true,
  "reference": "PST-1234567890-ABC123",
  "amount": 10000,
  "currency": "NGN",
  "status": "completed",
  "paidAt": "2024-01-15T10:30:00.000Z",
  "metadata": { "orderId": "uuid" }
}
```

#### Refund Payment

```http
POST /payments/refund
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "gateway": "paystack",
  "reference": "PST-1234567890-ABC123",
  "amount": 5000,
  "reason": "Customer request"
}
```

#### Reconcile Payment

```http
POST /payments/reconcile
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "gateway": "paystack",
  "reference": "PST-1234567890-ABC123",
  "notes": "Reconciled manually"
}
```

#### Get All Transactions

```http
GET /payments/transactions?gateway=paystack&status=completed&vendorId=uuid&reconciled=false
Authorization: Bearer <jwt-token>
```

#### Get Transaction by Reference

```http
GET /payments/transactions/PST-1234567890-ABC123
Authorization: Bearer <jwt-token>
```

#### Get Payment Statistics

```http
GET /payments/stats?vendorId=uuid
Authorization: Bearer <jwt-token>

Response:
{
  "totalTransactions": 150,
  "successfulTransactions": 145,
  "failedTransactions": 3,
  "pendingTransactions": 2,
  "totalAmount": 1500000,
  "totalRefunded": 15000,
  "reconciledCount": 140,
  "unreconciledCount": 5
}
```

### Public Endpoints (No Authentication)

#### Paystack Webhook

```http
POST /payments/webhooks/paystack
x-paystack-signature: <signature>
Content-Type: application/json

{
  "event": "charge.success",
  "data": {
    "reference": "PST-123",
    "status": "success",
    "amount": 1000000
  }
}
```

#### Monnify Webhook

```http
POST /payments/webhooks/monnify
monnify-signature: <signature>
Content-Type: application/json

{
  "event": "SUCCESSFUL_TRANSACTION",
  "data": {
    "paymentReference": "MNF-123",
    "paymentStatus": "PAID",
    "amountPaid": 10000
  }
}
```

## Environment Variables

Add these to your `.env` file:

```env
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key

# Monnify Configuration
MONNIFY_API_KEY=your_monnify_api_key
MONNIFY_SECRET_KEY=your_monnify_secret_key
MONNIFY_CONTRACT_CODE=your_monnify_contract_code
MONNIFY_BASE_URL=https://sandbox.monnify.com

# Production URLs
# MONNIFY_BASE_URL=https://api.monnify.com
```

## Database Schema

The `payment_transactions` table stores all payment information:

```sql
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY,
  reference VARCHAR(100) UNIQUE NOT NULL,
  gateway VARCHAR(50) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'NGN',
  customer_email VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  authorization_url TEXT,
  access_code VARCHAR(255),
  user_id UUID,
  vendor_id UUID,
  order_id UUID,
  metadata JSONB,
  gateway_response JSONB,
  callback_url TEXT,
  paid_at TIMESTAMP,
  refunded_amount DECIMAL(15,2) DEFAULT 0,
  refund_reference VARCHAR(100),
  refund_reason TEXT,
  refunded_at TIMESTAMP,
  failure_reason TEXT,
  webhook_attempts INT DEFAULT 0,
  last_webhook_at TIMESTAMP,
  reconciled BOOLEAN DEFAULT false,
  reconciled_at TIMESTAMP,
  reconciled_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX idx_payment_reference ON payment_transactions(reference);
CREATE INDEX idx_payment_gateway_status ON payment_transactions(gateway, status);
CREATE INDEX idx_payment_created_at ON payment_transactions(created_at);
```

## Payment Status Flow

```
PENDING → PROCESSING → COMPLETED
   ↓           ↓            ↓
FAILED      FAILED      REFUNDED
```

- **PENDING**: Payment initialized, awaiting user action
- **PROCESSING**: Payment being processed by gateway
- **COMPLETED**: Payment successful
- **FAILED**: Payment failed or declined
- **REFUNDED**: Payment refunded to customer

## Usage Examples

### Initialize a Payment

```typescript
import { PaymentsService } from './services/payments.service';
import { PaymentGateway } from './interfaces/payment-gateway.interface';

// Inject PaymentsService
constructor(private paymentsService: PaymentsService) {}

// Initialize payment
const result = await this.paymentsService.initializePayment(
  PaymentGateway.PAYSTACK,
  {
    amount: 10000,
    currency: 'NGN',
    email: 'customer@example.com',
    metadata: {
      orderId: 'order-123',
      customerId: 'customer-456',
    },
    callbackUrl: 'https://your-app.com/payment/callback',
  },
  userId,
  vendorId,
  orderId
);

// Redirect user to authorization URL
return { authorizationUrl: result.authorizationUrl };
```

### Verify a Payment

```typescript
// Verify payment after user completes payment
const verification = await this.paymentsService.verifyPayment(
  PaymentGateway.PAYSTACK,
  reference
);

if (verification.success && verification.status === 'completed') {
  // Update order status
  // Send confirmation email
  // Trigger fulfillment
}
```

### Process a Refund

```typescript
const refund = await this.paymentsService.refundPayment(
  PaymentGateway.PAYSTACK,
  {
    reference: 'PST-123',
    amount: 5000, // Optional: partial refund
    reason: 'Customer request',
  }
);

if (refund.success) {
  // Notify customer
  // Update order status
}
```

## Testing

### Run Tests

```bash
# Run all payment tests
npm test -- --testPathPattern=payment

# Run specific test file
npm test payment-gateways.spec.ts

# Run with coverage
npm test -- --coverage --testPathPattern=payment
```

### Test Coverage

Current test coverage:
- Payment Gateway Services: ✅ 100%
- Payment Transaction Service: ✅ 100%
- Webhook Service: ✅ 100%

### Manual Testing

Use test credentials from gateway dashboards:

**Paystack Test Card:**
```
Card Number: 4084084084084081
Expiry: Any future date
CVV: 408
PIN: 0000
OTP: 123456
```

**Monnify:**
Use sandbox environment with test credentials from dashboard.

## Security Considerations

1. **Webhook Signature Verification**
   - All webhooks are verified using HMAC SHA512
   - Rejecting invalid signatures prevents unauthorized requests

2. **Environment Variables**
   - Never commit secret keys to version control
   - Use different keys for development/staging/production

3. **HTTPS Only**
   - All API endpoints must use HTTPS in production
   - Webhook endpoints especially require HTTPS

4. **Idempotency**
   - Duplicate webhook deliveries are handled gracefully
   - Transaction updates are idempotent

5. **Input Validation**
   - All inputs are validated using DTOs
   - Amount validation prevents negative or zero amounts

6. **Authentication**
   - JWT authentication required for all non-webhook endpoints
   - Permission-based access control

## Monitoring & Logging

### Application Logs

```bash
# View payment-related logs
docker logs pharmacy-api | grep -i payment

# View webhook logs
docker logs pharmacy-api | grep -i webhook
```

### Database Queries

```sql
-- Check recent transactions
SELECT reference, gateway, amount, status, created_at
FROM payment_transactions
ORDER BY created_at DESC
LIMIT 20;

-- Check unreconciled payments
SELECT reference, gateway, amount, status, paid_at
FROM payment_transactions
WHERE status = 'completed' AND reconciled = false;

-- Check webhook delivery issues
SELECT reference, webhook_attempts, last_webhook_at, status
FROM payment_transactions
WHERE webhook_attempts > 3 AND status = 'pending';
```

## Troubleshooting

### Common Issues

1. **Payment initialization fails**
   - Check gateway credentials in environment variables
   - Verify network connectivity to gateway APIs
   - Check gateway service status

2. **Webhook not received**
   - Verify webhook URL is publicly accessible
   - Check webhook configuration in gateway dashboard
   - Review webhook delivery logs in gateway dashboard

3. **Signature verification fails**
   - Ensure correct secret key is configured
   - Verify environment (test vs live keys)
   - Check that raw body is being passed to verification

4. **Transaction not found**
   - Verify reference format is correct
   - Check if transaction was created successfully
   - Query database directly to confirm

## Documentation

- [Mobile Payment Integration Guide](../../docs/MOBILE-PAYMENT-INTEGRATION.md)
- [Webhook Setup Guide](../../docs/WEBHOOK-SETUP-GUIDE.md)
- API Documentation: Available at `/api-docs` endpoint

## Support

For issues or questions:
- Check documentation first
- Review gateway documentation (Paystack/Monnify)
- Contact support team

## Contributing

When adding new payment gateways:

1. Create a new service implementing `IPaymentGateway`
2. Add gateway to `PaymentGateway` enum
3. Update `PaymentGatewayFactory`
4. Add webhook endpoint
5. Add tests
6. Update documentation

## License

Copyright © 2024 Multi-Vendor Pharmacy Platform
