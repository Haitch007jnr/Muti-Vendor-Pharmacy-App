# Payment Gateway Webhook Setup Guide

## Overview

This guide explains how to configure webhooks for Paystack and Monnify payment gateways to receive real-time payment notifications.

## Table of Contents

1. [Why Webhooks?](#why-webhooks)
2. [Paystack Webhook Setup](#paystack-webhook-setup)
3. [Monnify Webhook Setup](#monnify-webhook-setup)
4. [Testing Webhooks](#testing-webhooks)
5. [Webhook Security](#webhook-security)
6. [Troubleshooting](#troubleshooting)

## Why Webhooks?

Webhooks provide real-time notifications about payment events:

- **Immediate updates**: Get notified instantly when payments complete
- **Reliability**: Don't rely on users returning to your app
- **Reconciliation**: Automatically track all payment statuses
- **Refunds**: Receive notifications about refund processing

## Paystack Webhook Setup

### Step 1: Get Your Webhook URL

Your webhook endpoint URL format:
```
https://your-domain.com/payments/webhooks/paystack
```

**Examples:**
- Production: `https://api.pharmacy-platform.com/payments/webhooks/paystack`
- Staging: `https://staging-api.pharmacy-platform.com/payments/webhooks/paystack`

### Step 2: Configure in Paystack Dashboard

1. Log in to your [Paystack Dashboard](https://dashboard.paystack.com/)
2. Navigate to **Settings** > **Webhooks**
3. Click **Add Webhook URL**
4. Enter your webhook URL
5. Select the events to receive:
   - ✅ `charge.success` - Payment successful
   - ✅ `charge.failed` - Payment failed
   - ✅ `refund.processed` - Refund completed
6. Click **Save**

### Step 3: Get Webhook Secret

After saving, Paystack will display a **webhook secret**. This is used to verify webhook signatures.

Add it to your environment variables:
```bash
PAYSTACK_SECRET_KEY=your_webhook_secret_here
```

### Step 4: Test Webhook

Paystack provides a test feature:
1. In the webhook settings, click **Test** next to your webhook
2. Select an event type
3. Click **Send Test**
4. Verify the webhook was received successfully

## Monnify Webhook Setup

### Step 1: Get Your Webhook URL

Your webhook endpoint URL format:
```
https://your-domain.com/payments/webhooks/monnify
```

**Examples:**
- Production: `https://api.pharmacy-platform.com/payments/webhooks/monnify`
- Staging: `https://staging-api.pharmacy-platform.com/payments/webhooks/monnify`

### Step 2: Configure in Monnify Dashboard

1. Log in to your [Monnify Dashboard](https://app.monnify.com/)
2. Navigate to **Settings** > **Webhooks** or **API Settings**
3. Add your webhook URL
4. Select events to subscribe to:
   - ✅ `SUCCESSFUL_TRANSACTION` - Payment successful
   - ✅ `FAILED_TRANSACTION` - Payment failed
   - ✅ `REFUND_COMPLETED` - Refund completed
5. Save the configuration

### Step 3: Get Webhook Secret

Monnify will provide a webhook secret or use your API secret key for verification.

Add it to your environment variables:
```bash
MONNIFY_SECRET_KEY=your_secret_key_here
MONNIFY_WEBHOOK_SECRET=your_webhook_secret_here
```

### Step 4: Test Webhook

Test using Monnify's sandbox environment:
1. Make a test transaction
2. Verify webhook delivery in your logs
3. Check Monnify dashboard for webhook delivery status

## Webhook Payload Examples

### Paystack Webhook Payload

**Successful Payment:**
```json
{
  "event": "charge.success",
  "data": {
    "id": 1234567,
    "domain": "live",
    "status": "success",
    "reference": "PST-1234567890-ABC123",
    "amount": 1000000,
    "message": null,
    "gateway_response": "Successful",
    "paid_at": "2024-01-15T10:30:00.000Z",
    "created_at": "2024-01-15T10:29:00.000Z",
    "channel": "card",
    "currency": "NGN",
    "ip_address": "192.168.1.1",
    "metadata": {
      "orderId": "order-123",
      "custom_fields": []
    },
    "customer": {
      "id": 123456,
      "email": "customer@example.com",
      "customer_code": "CUS_abc123"
    }
  }
}
```

**Failed Payment:**
```json
{
  "event": "charge.failed",
  "data": {
    "reference": "PST-1234567890-ABC123",
    "status": "failed",
    "gateway_response": "Declined",
    "amount": 1000000,
    "currency": "NGN"
  }
}
```

### Monnify Webhook Payload

**Successful Transaction:**
```json
{
  "event": "SUCCESSFUL_TRANSACTION",
  "data": {
    "transactionReference": "MNF1234567890",
    "paymentReference": "MNF-1234567890-ABC123",
    "amountPaid": 10000.00,
    "totalPayable": 10000.00,
    "settlementAmount": 9900.00,
    "paidOn": "2024-01-15T10:30:00.000Z",
    "paymentStatus": "PAID",
    "paymentDescription": "Payment for order",
    "transactionHash": "abc123def456",
    "currency": "NGN",
    "paymentMethod": "CARD",
    "customer": {
      "email": "customer@example.com",
      "name": "Customer Name"
    },
    "metaData": {
      "orderId": "order-123"
    }
  }
}
```

## Testing Webhooks

### Local Development Testing

For local testing, use [ngrok](https://ngrok.com/) to expose your local server:

```bash
# Start your local server
npm run dev

# In another terminal, start ngrok
ngrok http 4000
```

You'll get a public URL like: `https://abc123.ngrok.io`

Update webhook URLs in gateway dashboards:
- Paystack: `https://abc123.ngrok.io/payments/webhooks/paystack`
- Monnify: `https://abc123.ngrok.io/payments/webhooks/monnify`

### Using Webhook Testing Tools

**1. Request Bin:**
- Visit [https://requestbin.com/](https://requestbin.com/)
- Create a bin and use it as webhook URL temporarily
- Inspect received webhooks

**2. Webhook.site:**
- Visit [https://webhook.site/](https://webhook.site/)
- Copy the unique URL
- Use it to inspect webhook payloads

### Manual Testing with cURL

**Test Paystack Webhook:**
```bash
curl -X POST https://your-domain.com/payments/webhooks/paystack \
  -H "Content-Type: application/json" \
  -H "x-paystack-signature: YOUR_TEST_SIGNATURE" \
  -d '{
    "event": "charge.success",
    "data": {
      "reference": "PST-TEST-123",
      "status": "success",
      "amount": 1000000,
      "currency": "NGN"
    }
  }'
```

**Test Monnify Webhook:**
```bash
curl -X POST https://your-domain.com/payments/webhooks/monnify \
  -H "Content-Type: application/json" \
  -H "monnify-signature: YOUR_TEST_SIGNATURE" \
  -d '{
    "event": "SUCCESSFUL_TRANSACTION",
    "data": {
      "paymentReference": "MNF-TEST-123",
      "paymentStatus": "PAID",
      "amountPaid": 10000
    }
  }'
```

## Webhook Security

### Signature Verification

Both gateways sign webhooks with HMAC SHA512. Our backend automatically verifies signatures.

**Paystack Signature Verification:**
```javascript
const crypto = require('crypto');

function verifyPaystackSignature(payload, signature) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const hash = crypto
    .createHmac('sha512', secret)
    .update(payload)
    .digest('hex');
  
  return hash === signature;
}
```

**Monnify Signature Verification:**
```javascript
const crypto = require('crypto');

function verifyMonnifySignature(payload, signature) {
  const secret = process.env.MONNIFY_SECRET_KEY;
  const hash = crypto
    .createHmac('sha512', secret)
    .update(payload)
    .digest('hex');
  
  return hash === signature;
}
```

### Security Best Practices

1. **Always verify signatures** - Reject webhooks with invalid signatures
2. **Use HTTPS only** - Never expose webhook endpoints over HTTP
3. **Validate payload data** - Check all required fields exist
4. **Idempotency** - Handle duplicate webhook deliveries gracefully
5. **Rate limiting** - Implement rate limits on webhook endpoints
6. **IP whitelisting** (optional) - Restrict to known gateway IPs
7. **Logging** - Log all webhook attempts for debugging
8. **Monitoring** - Set up alerts for failed webhooks

### IP Whitelisting (Optional)

**Paystack IPs:**
```
52.31.139.75
52.49.173.169
52.214.14.220
```

**Monnify IPs:**
Check Monnify documentation for their current IP addresses.

## Webhook Handling Flow

```
1. Webhook received at endpoint
   ↓
2. Extract signature from headers
   ↓
3. Verify signature
   ↓
4. Parse payload
   ↓
5. Validate event type
   ↓
6. Extract payment reference
   ↓
7. Update transaction in database
   ↓
8. Trigger business logic (order fulfillment, notifications, etc.)
   ↓
9. Return 200 OK response
```

## Monitoring Webhooks

### View Webhook Logs

Check your application logs:
```bash
# Using Docker
docker logs pharmacy-api | grep webhook

# Using PM2
pm2 logs pharmacy-api | grep webhook
```

### Database Query

Check webhook attempts:
```sql
SELECT 
  reference,
  webhook_attempts,
  last_webhook_at,
  status,
  gateway
FROM payment_transactions
WHERE last_webhook_at IS NOT NULL
ORDER BY last_webhook_at DESC
LIMIT 50;
```

### Gateway Dashboard

Both Paystack and Monnify provide webhook delivery logs:
- View delivery status
- See retry attempts
- Check response codes
- Debug failed deliveries

## Troubleshooting

### Webhook Not Received

**Check:**
1. ✅ URL is correct and accessible
2. ✅ Server is running
3. ✅ No firewall blocking requests
4. ✅ SSL certificate is valid
5. ✅ Endpoint returns 200 OK

**Test:**
```bash
# Test endpoint accessibility
curl -I https://your-domain.com/payments/webhooks/paystack
```

### Signature Verification Failed

**Check:**
1. ✅ Using correct secret key
2. ✅ Secret key matches environment (test/live)
3. ✅ Receiving raw body (not parsed JSON)
4. ✅ Header name is correct

**Debug:**
```javascript
console.log('Received signature:', signature);
console.log('Computed signature:', computedSignature);
console.log('Raw payload:', rawPayload);
```

### Duplicate Webhooks

Gateways may send the same webhook multiple times. Handle idempotently:

```javascript
// Check if already processed
const transaction = await findByReference(reference);

if (transaction.webhookAttempts > 0 && transaction.status === 'completed') {
  // Already processed, return success
  return { status: 'already_processed' };
}

// Process webhook
await updateTransaction(reference, newStatus);
```

### Webhook Timeout

Respond quickly (within 10 seconds):

```javascript
// Quick response pattern
async function handleWebhook(payload) {
  // Respond immediately
  res.status(200).json({ status: 'received' });
  
  // Process asynchronously
  processWebhookAsync(payload).catch(error => {
    logger.error('Webhook processing error:', error);
  });
}
```

### Missing Webhooks

If webhooks are not arriving:

1. **Check gateway dashboard** for delivery attempts
2. **Verify endpoint** is publicly accessible
3. **Review logs** for any errors
4. **Manually verify** payment status via API
5. **Implement polling** as fallback

## Webhook Events Summary

### Paystack Events

| Event | Description | Action |
|-------|-------------|--------|
| `charge.success` | Payment completed | Update order status, send confirmation |
| `charge.failed` | Payment failed | Notify user, mark transaction failed |
| `refund.processed` | Refund completed | Update transaction, notify user |
| `transfer.success` | Transfer completed | Update transfer status |
| `transfer.failed` | Transfer failed | Handle failed transfer |

### Monnify Events

| Event | Description | Action |
|-------|-------------|--------|
| `SUCCESSFUL_TRANSACTION` | Payment completed | Update order status |
| `FAILED_TRANSACTION` | Payment failed | Mark transaction failed |
| `REFUND_COMPLETED` | Refund processed | Update refund status |
| `SETTLEMENT_COMPLETED` | Settlement done | Update settlement records |

## Production Checklist

Before going live:

- [ ] Webhook URLs configured in both dashboards
- [ ] Using production/live credentials
- [ ] Signature verification working
- [ ] SSL certificate valid and not expired
- [ ] Logging configured properly
- [ ] Monitoring and alerts set up
- [ ] Tested with real transactions
- [ ] Error handling in place
- [ ] Database transactions atomic
- [ ] Idempotency implemented
- [ ] Rate limiting configured
- [ ] Backup verification method available

## Support Resources

- **Paystack Documentation**: https://paystack.com/docs/payments/webhooks
- **Monnify Documentation**: https://docs.monnify.com
- **API Documentation**: Check `/api-docs` endpoint
- **Support Email**: support@pharmacy-platform.com

## Conclusion

Proper webhook setup is crucial for reliable payment processing. Always test thoroughly in sandbox mode before deploying to production. Monitor webhook delivery and handle failures gracefully.
