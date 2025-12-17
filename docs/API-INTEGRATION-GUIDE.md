# API Integration Guide

## Overview

This guide provides comprehensive instructions for integrating with the Multi-Vendor Pharmacy Platform API. The API follows REST principles and uses JSON for request and response payloads.

## Base URL

```
Development: http://localhost:4000/api/v1
Production: https://api.pharmacy.com/api/v1
```

## Authentication

### JWT Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Getting an Access Token

**Endpoint:** `POST /auth/login`

```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "customer"
    }
  }
}
```

### Refreshing Access Token

**Endpoint:** `POST /auth/refresh`

```json
{
  "refreshToken": "your-refresh-token"
}
```

## API Endpoints

### 1. Payment Integration

#### Initialize Payment

**Endpoint:** `POST /payments/initialize`

**Request:**

```json
{
  "gateway": "paystack",
  "amount": 10000,
  "currency": "NGN",
  "email": "customer@example.com",
  "metadata": {
    "orderId": "order-uuid",
    "customerId": "customer-uuid"
  },
  "callbackUrl": "https://your-app.com/payment/callback"
}
```

**Response:**

```json
{
  "success": true,
  "reference": "PST-1234567890-ABC123",
  "authorizationUrl": "https://checkout.paystack.com/xyz",
  "accessCode": "xyz"
}
```

#### Verify Payment

**Endpoint:** `GET /payments/verify?gateway=paystack&reference=PST-123`

**Response:**

```json
{
  "success": true,
  "reference": "PST-1234567890-ABC123",
  "amount": 10000,
  "currency": "NGN",
  "status": "completed",
  "paidAt": "2024-01-15T10:30:00.000Z",
  "metadata": {
    "orderId": "order-uuid"
  }
}
```

#### Get Transaction

**Endpoint:** `GET /payments/transactions/:reference`

**Response:**

```json
{
  "id": "uuid",
  "reference": "PST-123",
  "gateway": "paystack",
  "amount": 10000,
  "currency": "NGN",
  "status": "completed",
  "customerEmail": "customer@example.com",
  "paidAt": "2024-01-15T10:30:00.000Z",
  "metadata": {},
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```

### 2. Notification Integration

#### Send Notification

**Endpoint:** `POST /notifications/send`

**Request:**

```json
{
  "recipient": {
    "email": "user@example.com",
    "phone": "+1234567890",
    "deviceToken": "firebase-device-token",
    "userId": "user-id"
  },
  "payload": {
    "subject": "Order Confirmation",
    "body": "Your order has been confirmed",
    "data": {
      "orderId": "123",
      "status": "confirmed"
    }
  },
  "channel": "email",
  "priority": "high"
}
```

**Response:**

```json
{
  "success": true,
  "messageId": "msg-123",
  "status": "sent"
}
```

#### Send Template-Based Notification

**Endpoint:** `POST /notifications/send`

**Request:**

```json
{
  "recipient": {
    "email": "user@example.com"
  },
  "payload": {
    "body": ""
  },
  "channel": "email",
  "templateId": "order_confirmation",
  "variables": {
    "customerName": "John Doe",
    "orderId": "ORD-123",
    "orderDate": "2024-01-15",
    "totalAmount": "10,000"
  }
}
```

### 3. Product Management

#### Get Products

**Endpoint:** `GET /products?page=1&limit=20&vendorId=uuid`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `vendorId` (optional): Filter by vendor ID
- `category` (optional): Filter by category
- `search` (optional): Search by name or description

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Product Name",
      "description": "Product description",
      "price": 5000,
      "vendorId": "vendor-uuid",
      "category": "medicine",
      "inStock": true,
      "stockQuantity": 100
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### 4. Order Management

#### Create Order

**Endpoint:** `POST /orders`

**Request:**

```json
{
  "items": [
    {
      "productId": "product-uuid",
      "quantity": 2,
      "price": 5000
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Lagos",
    "state": "Lagos",
    "country": "Nigeria",
    "postalCode": "100001"
  },
  "paymentMethod": "online"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "order-uuid",
    "orderNumber": "ORD-20240115-001",
    "status": "pending",
    "totalAmount": 10000,
    "items": [...],
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

#### Get Order Status

**Endpoint:** `GET /orders/:orderId`

**Response:**

```json
{
  "id": "order-uuid",
  "orderNumber": "ORD-20240115-001",
  "status": "processing",
  "totalAmount": 10000,
  "items": [...],
  "payment": {
    "status": "completed",
    "reference": "PST-123"
  },
  "tracking": {
    "status": "in_transit",
    "estimatedDelivery": "2024-01-17"
  }
}
```

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing authentication token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `INVALID_REQUEST` | 400 | Invalid request parameters |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `PAYMENT_FAILED` | 400 | Payment processing failed |
| `INTERNAL_ERROR` | 500 | Internal server error |

## Rate Limiting

- **Rate Limit:** 100 requests per minute per IP
- **Headers:**
  - `X-RateLimit-Limit`: Maximum requests per minute
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

**Response when rate limited (429):**

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later."
  }
}
```

## Webhooks

### Payment Webhooks

Configure webhook URLs in your payment gateway dashboard:

**Paystack Webhook URL:** `https://api.pharmacy.com/api/v1/payments/webhooks/paystack`

**Monnify Webhook URL:** `https://api.pharmacy.com/api/v1/payments/webhooks/monnify`

### Webhook Payload Example (Paystack)

```json
{
  "event": "charge.success",
  "data": {
    "reference": "PST-123",
    "status": "success",
    "amount": 1000000,
    "currency": "NGN",
    "customer": {
      "email": "customer@example.com"
    },
    "metadata": {
      "orderId": "order-uuid"
    }
  }
}
```

### Webhook Signature Verification

All webhooks include a signature header for verification:

**Paystack:** `x-paystack-signature`
**Monnify:** `monnify-signature`

Verify the signature before processing the webhook to ensure authenticity.

## Mobile App Integration

### API Client Setup

#### React Native (Axios)

```typescript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const apiClient = axios.create({
  baseURL: 'https://api.pharmacy.com/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        const response = await axios.post(
          'https://api.pharmacy.com/api/v1/auth/refresh',
          { refreshToken }
        );
        
        const { accessToken } = response.data.data;
        await AsyncStorage.setItem('accessToken', accessToken);
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Example Usage

```typescript
import apiClient from './api-client';

// Get products
const getProducts = async (page = 1) => {
  try {
    const response = await apiClient.get('/products', {
      params: { page, limit: 20 }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
};

// Create order
const createOrder = async (orderData) => {
  try {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Failed to create order:', error);
    throw error;
  }
};

// Initialize payment
const initializePayment = async (paymentData) => {
  try {
    const response = await apiClient.post('/payments/initialize', paymentData);
    return response.data;
  } catch (error) {
    console.error('Payment initialization failed:', error);
    throw error;
  }
};
```

## Testing

### Using cURL

```bash
# Login
curl -X POST https://api.pharmacy.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Get products with auth token
curl -X GET https://api.pharmacy.com/api/v1/products \
  -H "Authorization: Bearer YOUR_TOKEN"

# Initialize payment
curl -X POST https://api.pharmacy.com/api/v1/payments/initialize \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "gateway": "paystack",
    "amount": 10000,
    "currency": "NGN",
    "email": "customer@example.com"
  }'
```

### Using Postman

1. Import the API collection (available in `/docs/api/postman-collection.json`)
2. Set environment variables:
   - `API_BASE_URL`: Your API base URL
   - `ACCESS_TOKEN`: Your JWT access token
3. Run requests from the collection

## Best Practices

1. **Always use HTTPS** in production
2. **Store tokens securely** using platform-specific secure storage
3. **Implement retry logic** for failed requests
4. **Handle token expiration** gracefully with refresh token flow
5. **Validate responses** before using data
6. **Log errors** for debugging
7. **Respect rate limits** to avoid being blocked
8. **Keep API client updated** with the latest SDK version

## Support

For API issues or questions:
- Email: api-support@pharmacy.com
- Documentation: https://docs.pharmacy.com
- API Status: https://status.pharmacy.com

## Changelog

### Version 1.0.0 (Current)
- Initial API release
- Payment gateway integration (Paystack, Monnify)
- Multi-channel notifications
- Order management
- Product catalog
