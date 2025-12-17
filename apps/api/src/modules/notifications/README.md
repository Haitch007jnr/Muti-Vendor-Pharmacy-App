# Notifications Module

## Overview

The Notifications module provides a comprehensive notification system with support for multiple channels: Email (SendGrid), SMS (Twilio), and Push Notifications (Firebase). It includes template management for dynamic message generation and variable substitution.

## Features

- **Multi-Channel Support**
  - Email notifications via SendGrid
  - SMS notifications via Twilio
  - Push notifications via Firebase Cloud Messaging (FCM)

- **Template Management**
  - Create, read, update, and delete notification templates
  - Variable substitution using `{{variableName}}` syntax
  - Support for different templates per channel
  - Active/inactive template status

- **Flexible API**
  - Direct notification sending
  - Template-based notification sending
  - Batch notification sending
  - Helper methods for common use cases

## Configuration

### Environment Variables

Add the following environment variables to your `.env` file:

```env
# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@pharmacy.com

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
```

## API Endpoints

### Send Notification

**POST** `/notifications/send`

Send a notification via any channel.

```json
{
  "recipient": {
    "email": "user@example.com",
    "phone": "+1234567890",
    "deviceToken": "firebase-device-token",
    "userId": "user-id"
  },
  "payload": {
    "subject": "Subject line",
    "body": "Message body",
    "data": {
      "customField": "value"
    },
    "imageUrl": "https://example.com/image.png"
  },
  "channel": "email",
  "priority": "high",
  "templateId": "template-id",
  "variables": {
    "name": "John Doe",
    "date": "2024-01-01"
  }
}
```

### Send Multiple Notifications

**POST** `/notifications/send/multiple`

Send multiple notifications in batch.

```json
[
  {
    "recipient": { "email": "user1@example.com" },
    "payload": { "subject": "Test", "body": "Message 1" },
    "channel": "email"
  },
  {
    "recipient": { "phone": "+1234567890" },
    "payload": { "body": "Message 2" },
    "channel": "sms"
  }
]
```

### Template Management

#### Create Template

**POST** `/notifications/templates`

```json
{
  "name": "welcome_email",
  "channel": "email",
  "subject": "Welcome {{name}}!",
  "body": "Hello {{name}}, welcome to our platform. Your account was created on {{date}}.",
  "variables": ["name", "date"],
  "description": "Welcome email for new users",
  "active": true
}
```

#### Get All Templates

**GET** `/notifications/templates?channel=email`

Query Parameters:
- `channel` (optional): Filter by channel (email, sms, push)

#### Get Template by ID

**GET** `/notifications/templates/:id`

#### Update Template

**PUT** `/notifications/templates/:id`

```json
{
  "subject": "Updated subject",
  "body": "Updated body",
  "active": true
}
```

#### Delete Template

**DELETE** `/notifications/templates/:id`

#### Render Template

**POST** `/notifications/templates/:id/render`

Test template rendering with variables.

```json
{
  "name": "John Doe",
  "date": "2024-01-01"
}
```

Response:
```json
{
  "subject": "Welcome John Doe!",
  "body": "Hello John Doe, welcome to our platform. Your account was created on 2024-01-01."
}
```

## Usage Examples

### Using the Service in Other Modules

```typescript
import { NotificationsService } from '../notifications/services/notifications.service';
import { NotificationChannel } from '../notifications/interfaces/notification-provider.interface';

@Injectable()
export class OrderService {
  constructor(private notificationsService: NotificationsService) {}

  async notifyOrderConfirmation(orderId: string, userEmail: string) {
    // Direct email sending
    await this.notificationsService.sendEmail(
      userEmail,
      'Order Confirmation',
      `Your order ${orderId} has been confirmed.`
    );

    // Template-based sending
    await this.notificationsService.send({
      recipient: { email: userEmail },
      payload: { body: '' },
      channel: NotificationChannel.EMAIL,
      templateId: 'order_confirmation',
      variables: { orderId, orderDate: new Date().toISOString() }
    });
  }

  async sendOrderStatusSMS(phone: string, status: string) {
    await this.notificationsService.sendSMS(
      phone,
      `Your order status has been updated to: ${status}`
    );
  }

  async sendPushNotification(deviceToken: string) {
    await this.notificationsService.sendPush(
      deviceToken,
      'Order Update',
      'Your order is out for delivery',
      { orderId: '12345', status: 'out_for_delivery' }
    );
  }
}
```

### Event-Driven Notifications

```typescript
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from '../notifications/services/notifications.service';

@Injectable()
export class NotificationEventHandler {
  constructor(private notificationsService: NotificationsService) {}

  @OnEvent('user.registered')
  async handleUserRegistered(payload: { email: string; name: string }) {
    await this.notificationsService.send({
      recipient: { email: payload.email },
      payload: { body: '' },
      channel: NotificationChannel.EMAIL,
      templateId: 'welcome_email',
      variables: { name: payload.name }
    });
  }

  @OnEvent('order.shipped')
  async handleOrderShipped(payload: { phone: string; trackingNumber: string }) {
    await this.notificationsService.sendSMS(
      payload.phone,
      `Your order has been shipped. Tracking: ${payload.trackingNumber}`
    );
  }
}
```

## Template Variables

Templates support variable substitution using the `{{variableName}}` syntax. Variables are replaced with actual values when the notification is sent.

Example:
- Template: `Hello {{name}}, your order {{orderId}} is ready!`
- Variables: `{ name: "John", orderId: "12345" }`
- Result: `Hello John, your order 12345 is ready!`

## Error Handling

All notification services return a `SendNotificationResponse` object:

```typescript
{
  success: boolean;
  messageId?: string;
  status: NotificationStatus;
  error?: string;
}
```

Status values:
- `PENDING`: Notification is queued for sending
- `SENT`: Notification was sent successfully
- `DELIVERED`: Notification was delivered (SMS only)
- `FAILED`: Notification failed to send

## Testing

Run the notification service tests:

```bash
npm test -- notifications
```

## Security Considerations

1. **API Keys**: Never commit API keys to version control. Use environment variables.
2. **Authentication**: All notification endpoints are protected with JWT authentication.
3. **Rate Limiting**: Consider implementing rate limiting for notification endpoints.
4. **Validation**: All inputs are validated using DTOs and class-validator.
5. **Logging**: All notification attempts are logged for audit purposes.

## Best Practices

1. **Use Templates**: Create templates for recurring notifications to ensure consistency.
2. **Handle Failures**: Always check the response status and handle failures gracefully.
3. **Batch Sending**: Use `sendMultiple()` for sending multiple notifications efficiently.
4. **Test First**: Test notifications in development/staging before production deployment.
5. **Monitor Usage**: Monitor your SendGrid, Twilio, and Firebase quotas to avoid service interruptions.

## Troubleshooting

### Email Not Sending

- Verify `SENDGRID_API_KEY` is valid
- Check SendGrid dashboard for blocked domains
- Ensure `SENDGRID_FROM_EMAIL` is verified in SendGrid

### SMS Not Sending

- Verify Twilio credentials are correct
- Check phone number format (E.164 format required: +1234567890)
- Ensure Twilio account has sufficient balance

### Push Notifications Not Working

- Verify Firebase credentials are correct
- Ensure device token is valid and not expired
- Check Firebase Console for error logs

## Future Enhancements

- [ ] Notification history and tracking
- [ ] Delivery status webhooks
- [ ] Advanced scheduling
- [ ] A/B testing for templates
- [ ] Analytics and reporting
- [ ] User notification preferences
