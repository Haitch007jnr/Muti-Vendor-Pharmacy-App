# Push Notifications Setup Guide

## Overview

This guide explains how to set up and implement push notifications using Firebase Cloud Messaging (FCM) for the Multi-Vendor Pharmacy Platform mobile applications.

## Prerequisites

- Firebase project created
- Firebase Admin SDK credentials
- Mobile apps registered in Firebase Console
- expo-notifications package installed (for Expo apps)

## Firebase Console Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: "Pharmacy App"
4. Follow setup wizard

### 2. Register Your Apps

#### For Android

1. In Firebase Console, click "Add app" → Android
2. Enter package name: `com.pharmacy.customer` (or vendor/delivery)
3. Download `google-services.json`
4. Place file in `apps/mobile-customer/android/app/`

#### For iOS

1. In Firebase Console, click "Add app" → iOS
2. Enter bundle ID: `com.pharmacy.customer`
3. Download `GoogleService-Info.plist`
4. Add file to Xcode project

### 3. Get Service Account Credentials

1. Go to Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save the JSON file securely
4. Extract the following values:
   - `project_id`
   - `private_key`
   - `client_email`

## Backend Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

**Important:** The private key must include newline characters (`\n`). Do not remove them.

### Verify Backend Setup

Run this test to verify Firebase is configured correctly:

```bash
cd apps/api
npm test -- firebase.service.spec.ts
```

## Mobile App Configuration

### Customer App

#### 1. Install Dependencies

```bash
cd apps/mobile-customer
npm install expo-notifications expo-device expo-constants
```

#### 2. Configure app.json

Add or update the plugins section:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff",
          "sounds": [
            "./assets/notification-sound.wav"
          ],
          "mode": "production"
        }
      ]
    ],
    "android": {
      "googleServicesFile": "./google-services.json",
      "permissions": [
        "NOTIFICATIONS",
        "RECEIVE_BOOT_COMPLETED"
      ]
    },
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist",
      "infoPlist": {
        "UIBackgroundModes": [
          "remote-notification"
        ]
      }
    }
  }
}
```

#### 3. Request Permissions

Create `src/services/notifications.service.ts`:

```typescript
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    
    // Get the token
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })
    ).data;
    
    console.log('Push notification token:', token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}

export async function sendTokenToBackend(token: string, userId: string) {
  try {
    const response = await fetch('https://api.pharmacy.com/api/v1/users/device-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        deviceToken: token,
        userId,
        platform: Platform.OS,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send token to backend');
    }
    
    console.log('Device token registered successfully');
  } catch (error) {
    console.error('Error sending token to backend:', error);
  }
}
```

#### 4. Initialize in App Component

Update `App.tsx`:

```typescript
import React, { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync, sendTokenToBackend } from './src/services/notifications.service';

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        // Send token to backend
        // Get userId from your auth state
        const userId = 'user-id-from-auth';
        sendTokenToBackend(token, userId);
      }
    });

    // Listen for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Listen for notification interactions
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      // Handle navigation based on notification data
      const data = response.notification.request.content.data;
      if (data.orderId) {
        // Navigate to order details
        navigation.navigate('OrderDetails', { orderId: data.orderId });
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // Rest of your app component
  return (
    // Your app UI
  );
}
```

### 5. Handle Deep Linking

Create `src/navigation/linking.ts`:

```typescript
import * as Linking from 'expo-linking';

const prefix = Linking.createURL('/');

const linking = {
  prefixes: [prefix, 'pharmacy://'],
  config: {
    screens: {
      Home: '',
      OrderDetails: 'orders/:orderId',
      ProductDetails: 'products/:productId',
      Notifications: 'notifications',
    },
  },
};

export default linking;
```

Update your NavigationContainer:

```typescript
import linking from './src/navigation/linking';

<NavigationContainer linking={linking}>
  {/* Your navigation */}
</NavigationContainer>
```

## Sending Notifications

### From Backend API

#### Send to Single User

```typescript
import { NotificationsService } from './notifications/services/notifications.service';

@Injectable()
export class OrderService {
  constructor(private notificationsService: NotificationsService) {}

  async notifyOrderShipped(orderId: string, userId: string, deviceToken: string) {
    await this.notificationsService.sendPush(
      deviceToken,
      'Order Shipped!',
      'Your order is on the way',
      {
        orderId,
        type: 'order_shipped',
        action: 'view_order',
      }
    );
  }
}
```

#### Send to Multiple Users

```typescript
async notifyMultipleUsers(userTokens: string[], title: string, body: string) {
  const notifications = userTokens.map(token => ({
    recipient: { deviceToken: token },
    payload: {
      subject: title,
      body: body,
      data: { type: 'announcement' },
    },
    channel: NotificationChannel.PUSH,
  }));

  await this.notificationsService.sendMultiple(notifications);
}
```

### Using Templates

```typescript
// Create template
await this.notificationsService.createTemplate({
  name: 'order_shipped',
  channel: NotificationChannel.PUSH,
  subject: 'Order Shipped',
  body: 'Hi {{customerName}}, your order {{orderId}} is on the way!',
  variables: ['customerName', 'orderId'],
});

// Send using template
await this.notificationsService.send({
  recipient: { deviceToken: userToken },
  payload: { body: '' },
  channel: NotificationChannel.PUSH,
  templateId: 'order_shipped',
  variables: {
    customerName: 'John Doe',
    orderId: 'ORD-123',
  },
});
```

### Via API Endpoint

```bash
curl -X POST https://api.pharmacy.com/api/v1/notifications/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": {
      "deviceToken": "ExponentPushToken[xxxxxx]",
      "userId": "user-id"
    },
    "payload": {
      "subject": "Order Update",
      "body": "Your order has been shipped",
      "data": {
        "orderId": "123",
        "type": "order_shipped"
      }
    },
    "channel": "push",
    "priority": "high"
  }'
```

## Testing

### 1. Test Token Registration

```bash
# Check if device token is registered
curl -X GET https://api.pharmacy.com/api/v1/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response should include deviceToken field
```

### 2. Send Test Notification

```bash
curl -X POST https://api.pharmacy.com/api/v1/notifications/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": {
      "deviceToken": "ExponentPushToken[YOUR_TOKEN]"
    },
    "payload": {
      "subject": "Test Notification",
      "body": "This is a test notification"
    },
    "channel": "push"
  }'
```

### 3. Test in Expo Go

For development with Expo Go:

```bash
cd apps/mobile-customer
npx expo start

# Scan QR code with Expo Go app
# Test notifications on physical device
```

**Note:** Push notifications do not work in iOS Simulator. Use a physical device for testing.

## Production Build

### Android

```bash
cd apps/mobile-customer

# Build APK
eas build --platform android --profile production

# Or build AAB for Play Store
eas build --platform android --profile production --output aab
```

### iOS

```bash
cd apps/mobile-customer

# Build for App Store
eas build --platform ios --profile production
```

## Notification Types

### Order Notifications

```typescript
// Order confirmed
{
  title: 'Order Confirmed',
  body: 'Your order #{{orderNumber}} has been confirmed',
  data: { orderId, type: 'order_confirmed' }
}

// Order shipped
{
  title: 'Order Shipped',
  body: 'Your order is on the way!',
  data: { orderId, trackingNumber, type: 'order_shipped' }
}

// Order delivered
{
  title: 'Order Delivered',
  body: 'Your order has been delivered',
  data: { orderId, type: 'order_delivered' }
}
```

### Promotional Notifications

```typescript
{
  title: 'Special Offer!',
  body: 'Get 20% off on all medicines today',
  data: { promoCode: 'SAVE20', type: 'promotion' }
}
```

### System Notifications

```typescript
{
  title: 'Account Update',
  body: 'Your profile has been updated successfully',
  data: { type: 'account_update' }
}
```

## Best Practices

1. **Request permissions at appropriate time** - Don't ask immediately on app launch
2. **Provide value** - Only send notifications that benefit the user
3. **Allow opt-out** - Respect user notification preferences
4. **Use categories** - Let users control which notification types they receive
5. **Test thoroughly** - Test on both iOS and Android devices
6. **Handle errors gracefully** - Token may be invalid or expired
7. **Use deep linking** - Navigate to relevant content when notification is tapped
8. **Respect quiet hours** - Don't send non-urgent notifications at night
9. **Track engagement** - Monitor open rates and adjust strategy

## Troubleshooting

### Notifications Not Received

1. Check device token is registered in backend
2. Verify Firebase credentials are correct
3. Ensure app has notification permissions
4. Check device is connected to internet
5. Verify notification payload is valid

### iOS Issues

- Ensure Apple Push Notification service (APNs) certificate is configured
- Check bundle identifier matches Firebase configuration
- Verify app is registered for remote notifications
- Test on physical device (not simulator)

### Android Issues

- Verify `google-services.json` is in correct location
- Check package name matches Firebase configuration
- Ensure notification channel is created (Android 8+)
- Test with different Android versions

## Firebase Cloud Messaging Quotas

- **Free Tier:** Unlimited messages
- **Rate Limits:**
  - 1,000 messages per second per project
  - 600,000 requests per minute

## Monitoring

### Firebase Console

1. Go to Cloud Messaging → Reports
2. View delivery statistics
3. Check error rates
4. Monitor engagement metrics

### Backend Logs

```bash
# View notification logs
docker logs pharmacy-api | grep -i notification

# Check Firebase service logs
docker logs pharmacy-api | grep -i firebase
```

## Security Considerations

1. **Protect device tokens** - Store securely in database
2. **Validate requests** - Ensure only authenticated users can send notifications
3. **Sanitize content** - Validate notification content before sending
4. **Rate limiting** - Prevent notification spam
5. **Audit trail** - Log all notification sends

## Additional Resources

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Expo Notifications Documentation](https://docs.expo.dev/push-notifications/overview/)
- [React Native Firebase](https://rnfirebase.io/)
- [APNs Documentation](https://developer.apple.com/documentation/usernotifications)

## Support

For push notification issues:
- Email: support@pharmacy.com
- Documentation: https://docs.pharmacy.com/notifications
- Firebase Status: https://status.firebase.google.com/
