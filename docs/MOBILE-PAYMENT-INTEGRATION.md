# Mobile Payment Integration Guide

## Overview

This guide explains how to integrate Paystack and Monnify payment gateways into your mobile applications (iOS and Android) using the Multi-Vendor Pharmacy Platform API.

## Table of Contents

1. [Payment Flow](#payment-flow)
2. [API Integration](#api-integration)
3. [Paystack Mobile SDK](#paystack-mobile-sdk)
4. [Monnify Mobile SDK](#monnify-mobile-sdk)
5. [Webhook Verification](#webhook-verification)
6. [Error Handling](#error-handling)
7. [Testing](#testing)

## Payment Flow

### Standard Payment Flow

```
1. User selects items and proceeds to checkout
2. Mobile app calls API to initialize payment
3. API returns authorization URL and payment reference
4. Mobile app launches payment gateway SDK or webview
5. User completes payment on gateway interface
6. Gateway sends webhook to backend
7. Mobile app verifies payment status
8. Display confirmation to user
```

## API Integration

### Base URL

```
Production: https://api.pharmacy-platform.com
Staging: https://staging-api.pharmacy-platform.com
Development: http://localhost:4000
```

### Authentication

All payment endpoints (except webhooks) require JWT authentication.

```
Authorization: Bearer <your-jwt-token>
```

### Initialize Payment

**Endpoint:** `POST /payments/initialize`

**Request Body:**
```json
{
  "gateway": "paystack",
  "amount": 10000,
  "currency": "NGN",
  "email": "customer@example.com",
  "reference": "optional-custom-reference",
  "metadata": {
    "orderId": "uuid-of-order",
    "customerId": "uuid-of-customer",
    "items": ["Product A", "Product B"]
  },
  "callbackUrl": "https://your-app.com/payment/callback"
}
```

**Response:**
```json
{
  "success": true,
  "reference": "PST-1234567890-ABC123",
  "authorizationUrl": "https://checkout.paystack.com/abc123xyz",
  "accessCode": "abc123xyz"
}
```

### Verify Payment

**Endpoint:** `GET /payments/verify`

**Query Parameters:**
- `gateway`: `paystack` or `monnify`
- `reference`: Payment reference from initialization

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
    "orderId": "uuid-of-order"
  }
}
```

## Paystack Mobile SDK

### React Native Integration

#### Installation

```bash
npm install react-native-paystack-webview
```

#### Usage

```javascript
import PaystackWebView from 'react-native-paystack-webview';
import { useState } from 'react';

function CheckoutScreen() {
  const [paystackKey, setPaystackKey] = useState('pk_test_xxxx');
  const [paymentData, setPaymentData] = useState(null);

  // Step 1: Initialize payment via API
  const initializePayment = async () => {
    const response = await fetch('https://api.pharmacy-platform.com/payments/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${yourJwtToken}`,
      },
      body: JSON.stringify({
        gateway: 'paystack',
        amount: 10000,
        currency: 'NGN',
        email: 'customer@example.com',
        metadata: {
          orderId: 'order-123',
        },
      }),
    });

    const data = await response.json();
    setPaymentData(data);
  };

  // Step 2: Handle payment success
  const handlePaymentSuccess = async (response) => {
    console.log('Payment successful:', response);
    
    // Verify payment on backend
    const verification = await fetch(
      `https://api.pharmacy-platform.com/payments/verify?gateway=paystack&reference=${response.data.reference}`,
      {
        headers: {
          'Authorization': `Bearer ${yourJwtToken}`,
        },
      }
    );

    const result = await verification.json();
    if (result.success && result.status === 'completed') {
      // Update UI, navigate to success screen
      console.log('Payment verified!');
    }
  };

  // Step 3: Handle payment cancellation
  const handlePaymentCancel = () => {
    console.log('Payment cancelled by user');
    // Handle cancellation
  };

  return (
    <View>
      <Button title="Pay Now" onPress={initializePayment} />
      
      {paymentData && (
        <PaystackWebView
          paystackKey={paystackKey}
          amount={paymentData.amount}
          billingEmail="customer@example.com"
          billingName="Customer Name"
          channels={['card', 'bank', 'ussd', 'qr', 'mobile_money']}
          refNumber={paymentData.reference}
          onCancel={handlePaymentCancel}
          onSuccess={handlePaymentSuccess}
          autoStart={true}
        />
      )}
    </View>
  );
}
```

### Flutter Integration

#### Installation

Add to `pubspec.yaml`:
```yaml
dependencies:
  flutter_paystack: ^1.0.7
```

#### Usage

```dart
import 'package:flutter_paystack/flutter_paystack.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class PaymentService {
  final plugin = PaystackPlugin();
  final String publicKey = 'pk_test_xxxx';
  final String backendUrl = 'https://api.pharmacy-platform.com';
  final String jwtToken = 'your-jwt-token';

  Future<void> initializePlugin() async {
    await plugin.initialize(publicKey: publicKey);
  }

  Future<Map<String, dynamic>> initializePayment({
    required double amount,
    required String email,
    required String orderId,
  }) async {
    final response = await http.post(
      Uri.parse('$backendUrl/payments/initialize'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $jwtToken',
      },
      body: jsonEncode({
        'gateway': 'paystack',
        'amount': amount,
        'currency': 'NGN',
        'email': email,
        'metadata': {
          'orderId': orderId,
        },
      }),
    );

    return jsonDecode(response.body);
  }

  Future<bool> makePayment({
    required double amount,
    required String email,
    required String reference,
  }) async {
    Charge charge = Charge()
      ..amount = (amount * 100).toInt() // Convert to kobo
      ..email = email
      ..reference = reference
      ..currency = 'NGN';

    CheckoutResponse response = await plugin.checkout(
      context,
      charge: charge,
      method: CheckoutMethod.card,
    );

    if (response.status == true) {
      // Verify payment on backend
      return await verifyPayment(reference);
    }
    return false;
  }

  Future<bool> verifyPayment(String reference) async {
    final response = await http.get(
      Uri.parse('$backendUrl/payments/verify?gateway=paystack&reference=$reference'),
      headers: {
        'Authorization': 'Bearer $jwtToken',
      },
    );

    final data = jsonDecode(response.body);
    return data['success'] == true && data['status'] == 'completed';
  }
}

// Usage in widget
class CheckoutPage extends StatefulWidget {
  @override
  _CheckoutPageState createState() => _CheckoutPageState();
}

class _CheckoutPageState extends State<CheckoutPage> {
  final paymentService = PaymentService();

  @override
  void initState() {
    super.initState();
    paymentService.initializePlugin();
  }

  Future<void> _handlePayment() async {
    // Initialize payment
    final paymentData = await paymentService.initializePayment(
      amount: 10000,
      email: 'customer@example.com',
      orderId: 'order-123',
    );

    // Process payment
    final success = await paymentService.makePayment(
      amount: 10000,
      email: 'customer@example.com',
      reference: paymentData['reference'],
    );

    if (success) {
      // Navigate to success screen
      print('Payment successful!');
    } else {
      // Show error
      print('Payment failed!');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: ElevatedButton(
          onPressed: _handlePayment,
          child: Text('Pay Now'),
        ),
      ),
    );
  }
}
```

## Monnify Mobile SDK

### React Native Integration

```javascript
import { WebView } from 'react-native-webview';

function MonnifyCheckout({ paymentData, onSuccess, onCancel }) {
  const handleNavigationStateChange = (navState) => {
    const { url } = navState;
    
    // Check if payment completed (redirected to callback URL)
    if (url.includes('payment/success')) {
      onSuccess();
    } else if (url.includes('payment/cancel')) {
      onCancel();
    }
  };

  return (
    <WebView
      source={{ uri: paymentData.authorizationUrl }}
      onNavigationStateChange={handleNavigationStateChange}
      startInLoadingState={true}
    />
  );
}

// Usage
const initializeMonnifyPayment = async () => {
  const response = await fetch('https://api.pharmacy-platform.com/payments/initialize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${yourJwtToken}`,
    },
    body: JSON.stringify({
      gateway: 'monnify',
      amount: 10000,
      currency: 'NGN',
      email: 'customer@example.com',
      callbackUrl: 'myapp://payment/callback',
      metadata: {
        orderId: 'order-123',
      },
    }),
  });

  const data = await response.json();
  // Open WebView with authorization URL
  navigation.navigate('MonnifyWebView', { paymentData: data });
};
```

### Flutter Integration

```dart
import 'package:webview_flutter/webview_flutter.dart';

class MonnifyWebView extends StatefulWidget {
  final String authorizationUrl;
  final Function onSuccess;
  final Function onCancel;

  MonnifyWebView({
    required this.authorizationUrl,
    required this.onSuccess,
    required this.onCancel,
  });

  @override
  _MonnifyWebViewState createState() => _MonnifyWebViewState();
}

class _MonnifyWebViewState extends State<MonnifyWebView> {
  late WebViewController controller;

  @override
  void initState() {
    super.initState();
    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onNavigationRequest: (NavigationRequest request) {
            if (request.url.contains('payment/success')) {
              widget.onSuccess();
              return NavigationDecision.prevent;
            } else if (request.url.contains('payment/cancel')) {
              widget.onCancel();
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse(widget.authorizationUrl));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Complete Payment')),
      body: WebViewWidget(controller: controller),
    );
  }
}
```

## Webhook Verification

Webhooks are automatically handled by the backend. The mobile app should:

1. After payment gateway redirect, verify payment status via API
2. Poll the verification endpoint if needed
3. Never trust client-side payment confirmation alone

```javascript
// Example polling function
async function pollPaymentStatus(reference, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await verifyPayment(reference);
    
    if (result.status === 'completed' || result.status === 'failed') {
      return result;
    }
    
    // Wait 2 seconds before next attempt
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  throw new Error('Payment verification timeout');
}
```

## Error Handling

### Common Error Scenarios

1. **Network Errors**
```javascript
try {
  const result = await initializePayment();
} catch (error) {
  if (error.message.includes('Network')) {
    // Show network error message
    Alert.alert('Network Error', 'Please check your connection');
  }
}
```

2. **Payment Declined**
```javascript
if (result.status === 'failed') {
  Alert.alert('Payment Failed', result.failureReason || 'Payment was declined');
}
```

3. **Timeout**
```javascript
const timeoutPromise = new Promise((_, reject) =>
  setTimeout(() => reject(new Error('Timeout')), 30000)
);

try {
  const result = await Promise.race([
    verifyPayment(reference),
    timeoutPromise
  ]);
} catch (error) {
  if (error.message === 'Timeout') {
    // Handle timeout
  }
}
```

## Testing

### Test Credentials

**Paystack Test Cards:**
```
Success: 4084084084084081
PIN: 0000
OTP: 123456
```

**Monnify Test:**
```
Use sandbox environment URL: https://sandbox.monnify.com
Sandbox credentials from Monnify dashboard
```

### Test Flow

1. Use test mode credentials in development
2. Test successful payment flow
3. Test payment cancellation
4. Test network errors
5. Test webhook delivery delays
6. Test refund scenarios

### Example Test Suite (React Native)

```javascript
describe('Payment Integration', () => {
  it('should initialize payment successfully', async () => {
    const result = await initializePayment({
      gateway: 'paystack',
      amount: 10000,
      email: 'test@example.com',
    });
    
    expect(result.success).toBe(true);
    expect(result.reference).toBeDefined();
    expect(result.authorizationUrl).toBeDefined();
  });

  it('should verify completed payment', async () => {
    const reference = 'PST-1234567890-ABC123';
    const result = await verifyPayment('paystack', reference);
    
    expect(result.success).toBe(true);
    expect(result.status).toBe('completed');
  });
});
```

## Best Practices

1. **Always verify payments on the backend** - Never trust client-side confirmation alone
2. **Store payment references** - Link them to orders in your local database
3. **Handle network issues gracefully** - Implement retry logic for API calls
4. **Provide clear user feedback** - Show loading states and error messages
5. **Test thoroughly** - Use sandbox/test modes extensively before production
6. **Secure JWT tokens** - Store tokens securely using platform-specific secure storage
7. **Implement timeout handling** - Don't let users wait indefinitely
8. **Log payment attempts** - For debugging and customer support

## Support

For issues or questions:
- Backend API: Check API documentation at `/api-docs`
- Paystack: https://paystack.com/docs
- Monnify: https://docs.monnify.com

## Security Considerations

1. Never expose secret keys in mobile apps
2. Always use HTTPS for API calls
3. Validate SSL certificates
4. Implement certificate pinning for production
5. Use secure storage for JWT tokens
6. Clear sensitive data after payment
7. Implement payment amount limits
8. Log suspicious activities

## Conclusion

This integration provides a secure and reliable payment experience for mobile users. Always test thoroughly in sandbox mode before deploying to production.
