import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from '../services/notifications.service';
import { SendGridService } from '../services/sendgrid.service';
import { TwilioService } from '../services/twilio.service';
import { FirebaseService } from '../services/firebase.service';
import { TemplateService } from '../services/template.service';
import {
  NotificationChannel,
  NotificationStatus,
} from '../interfaces/notification-provider.interface';

describe('NotificationsService - Integration Tests', () => {
  let service: NotificationsService;
  let sendGridService: SendGridService;
  let twilioService: TwilioService;
  let firebaseService: FirebaseService;
  let templateService: TemplateService;

  const mockSuccessResponse = {
    success: true,
    messageId: 'msg-123',
    status: NotificationStatus.SENT,
  };

  const mockTemplate = {
    id: 'template-123',
    name: 'order_confirmation',
    channel: NotificationChannel.EMAIL,
    subject: 'Order Confirmation - {{orderNumber}}',
    body: 'Hello {{customerName}}, your order {{orderNumber}} has been confirmed.',
    variables: ['orderNumber', 'customerName'],
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: SendGridService,
          useValue: {
            getChannel: jest.fn(() => NotificationChannel.EMAIL),
            send: jest.fn(),
          },
        },
        {
          provide: TwilioService,
          useValue: {
            getChannel: jest.fn(() => NotificationChannel.SMS),
            send: jest.fn(),
          },
        },
        {
          provide: FirebaseService,
          useValue: {
            getChannel: jest.fn(() => NotificationChannel.PUSH),
            send: jest.fn(),
          },
        },
        {
          provide: TemplateService,
          useValue: {
            findById: jest.fn(),
            render: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    sendGridService = module.get<SendGridService>(SendGridService);
    twilioService = module.get<TwilioService>(TwilioService);
    firebaseService = module.get<FirebaseService>(FirebaseService);
    templateService = module.get<TemplateService>(TemplateService);
  });

  describe('Email Notifications', () => {
    it('should send email notification successfully', async () => {
      jest
        .spyOn(sendGridService, 'send')
        .mockResolvedValue(mockSuccessResponse);

      const result = await service.send({
        recipient: { email: 'user@example.com' },
        payload: {
          subject: 'Test Email',
          body: 'This is a test email',
        },
        channel: NotificationChannel.EMAIL,
      });

      expect(result.success).toBe(true);
      expect(sendGridService.send).toHaveBeenCalledWith(
        expect.objectContaining({
          recipient: expect.objectContaining({
            email: 'user@example.com',
          }),
          payload: expect.objectContaining({
            subject: 'Test Email',
            body: 'This is a test email',
          }),
        }),
      );
    });

    it('should use sendEmail helper method', async () => {
      jest
        .spyOn(sendGridService, 'send')
        .mockResolvedValue(mockSuccessResponse);

      const result = await service.sendEmail(
        'user@example.com',
        'Test Subject',
        'Test Body',
      );

      expect(result.success).toBe(true);
      expect(sendGridService.send).toHaveBeenCalled();
    });

    it('should handle email sending failure', async () => {
      jest.spyOn(sendGridService, 'send').mockResolvedValue({
        success: false,
        status: NotificationStatus.FAILED,
        error: 'Invalid email address',
      });

      const result = await service.sendEmail(
        'invalid-email',
        'Test',
        'Body',
      );

      expect(result.success).toBe(false);
      expect(result.status).toBe(NotificationStatus.FAILED);
    });
  });

  describe('SMS Notifications', () => {
    it('should send SMS notification successfully', async () => {
      jest.spyOn(twilioService, 'send').mockResolvedValue(mockSuccessResponse);

      const result = await service.send({
        recipient: { phone: '+1234567890' },
        payload: {
          body: 'This is a test SMS',
        },
        channel: NotificationChannel.SMS,
      });

      expect(result.success).toBe(true);
      expect(twilioService.send).toHaveBeenCalledWith(
        expect.objectContaining({
          recipient: expect.objectContaining({
            phone: '+1234567890',
          }),
        }),
      );
    });

    it('should use sendSMS helper method', async () => {
      jest.spyOn(twilioService, 'send').mockResolvedValue(mockSuccessResponse);

      const result = await service.sendSMS(
        '+1234567890',
        'Your order has been shipped',
      );

      expect(result.success).toBe(true);
      expect(twilioService.send).toHaveBeenCalled();
    });

    it('should validate phone number format', async () => {
      jest.spyOn(twilioService, 'send').mockResolvedValue({
        success: false,
        status: NotificationStatus.FAILED,
        error: 'Invalid phone number',
      });

      const result = await service.sendSMS('invalid-phone', 'Test message');

      expect(result.success).toBe(false);
    });
  });

  describe('Push Notifications', () => {
    it('should send push notification successfully', async () => {
      jest
        .spyOn(firebaseService, 'send')
        .mockResolvedValue(mockSuccessResponse);

      const result = await service.send({
        recipient: { deviceToken: 'device-token-123' },
        payload: {
          subject: 'Order Update',
          body: 'Your order is on the way',
          data: { orderId: '123', status: 'shipped' },
        },
        channel: NotificationChannel.PUSH,
      });

      expect(result.success).toBe(true);
      expect(firebaseService.send).toHaveBeenCalledWith(
        expect.objectContaining({
          recipient: expect.objectContaining({
            deviceToken: 'device-token-123',
          }),
          payload: expect.objectContaining({
            data: expect.objectContaining({
              orderId: '123',
            }),
          }),
        }),
      );
    });

    it('should use sendPush helper method', async () => {
      jest
        .spyOn(firebaseService, 'send')
        .mockResolvedValue(mockSuccessResponse);

      const result = await service.sendPush(
        'device-token-123',
        'Order Update',
        'Your order is on the way',
        { orderId: '123' },
      );

      expect(result.success).toBe(true);
      expect(firebaseService.send).toHaveBeenCalled();
    });

    it('should handle invalid device token', async () => {
      jest.spyOn(firebaseService, 'send').mockResolvedValue({
        success: false,
        status: NotificationStatus.FAILED,
        error: 'Invalid device token',
      });

      const result = await service.sendPush(
        'invalid-token',
        'Test',
        'Message',
      );

      expect(result.success).toBe(false);
    });
  });

  describe('Template-based Notifications', () => {
    it('should send notification using template', async () => {
      jest
        .spyOn(templateService, 'findById')
        .mockResolvedValue(mockTemplate as any);
      jest.spyOn(templateService, 'render').mockResolvedValue({
        subject: 'Order Confirmation - ORD-123',
        body: 'Hello John Doe, your order ORD-123 has been confirmed.',
      });
      jest
        .spyOn(sendGridService, 'send')
        .mockResolvedValue(mockSuccessResponse);

      const result = await service.send({
        recipient: { email: 'user@example.com' },
        payload: { body: '' },
        channel: NotificationChannel.EMAIL,
        templateId: 'template-123',
        variables: {
          orderNumber: 'ORD-123',
          customerName: 'John Doe',
        },
      });

      expect(result.success).toBe(true);
      expect(templateService.findById).toHaveBeenCalledWith('template-123');
      expect(templateService.render).toHaveBeenCalledWith(
        mockTemplate,
        expect.objectContaining({
          orderNumber: 'ORD-123',
          customerName: 'John Doe',
        }),
      );
      expect(sendGridService.send).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            subject: 'Order Confirmation - ORD-123',
            body: 'Hello John Doe, your order ORD-123 has been confirmed.',
          }),
        }),
      );
    });

    it('should handle missing template', async () => {
      jest.spyOn(templateService, 'findById').mockResolvedValue(null);

      await expect(
        service.send({
          recipient: { email: 'user@example.com' },
          payload: { body: '' },
          channel: NotificationChannel.EMAIL,
          templateId: 'non-existent',
        }),
      ).rejects.toThrow('Template not found');
    });

    it('should handle missing template variables', async () => {
      jest
        .spyOn(templateService, 'findById')
        .mockResolvedValue(mockTemplate as any);

      await expect(
        service.send({
          recipient: { email: 'user@example.com' },
          payload: { body: '' },
          channel: NotificationChannel.EMAIL,
          templateId: 'template-123',
          variables: {
            // Missing required variables
            orderNumber: 'ORD-123',
          },
        }),
      ).rejects.toThrow();
    });

    it('should handle template channel mismatch', async () => {
      jest
        .spyOn(templateService, 'findById')
        .mockResolvedValue(mockTemplate as any);

      await expect(
        service.send({
          recipient: { phone: '+1234567890' },
          payload: { body: '' },
          channel: NotificationChannel.SMS,
          templateId: 'template-123',
        }),
      ).rejects.toThrow('Template channel mismatch');
    });
  });

  describe('Batch Notifications', () => {
    it('should send multiple notifications', async () => {
      jest
        .spyOn(sendGridService, 'send')
        .mockResolvedValue(mockSuccessResponse);
      jest.spyOn(twilioService, 'send').mockResolvedValue(mockSuccessResponse);

      const notifications = [
        {
          recipient: { email: 'user1@example.com' },
          payload: { subject: 'Test 1', body: 'Body 1' },
          channel: NotificationChannel.EMAIL,
        },
        {
          recipient: { phone: '+1234567890' },
          payload: { body: 'SMS message' },
          channel: NotificationChannel.SMS,
        },
      ];

      const results = await service.sendMultiple(notifications);

      expect(results).toHaveLength(2);
      expect(results.every((r) => r.success)).toBe(true);
      expect(sendGridService.send).toHaveBeenCalledTimes(1);
      expect(twilioService.send).toHaveBeenCalledTimes(1);
    });

    it('should handle partial failures in batch', async () => {
      jest
        .spyOn(sendGridService, 'send')
        .mockResolvedValueOnce(mockSuccessResponse)
        .mockResolvedValueOnce({
          success: false,
          status: NotificationStatus.FAILED,
          error: 'Failed to send',
        });

      const notifications = [
        {
          recipient: { email: 'user1@example.com' },
          payload: { subject: 'Test 1', body: 'Body 1' },
          channel: NotificationChannel.EMAIL,
        },
        {
          recipient: { email: 'user2@example.com' },
          payload: { subject: 'Test 2', body: 'Body 2' },
          channel: NotificationChannel.EMAIL,
        },
      ];

      const results = await service.sendMultiple(notifications);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
    });
  });

  describe('Notification Priority', () => {
    it('should handle high priority notifications', async () => {
      jest
        .spyOn(firebaseService, 'send')
        .mockResolvedValue(mockSuccessResponse);

      const result = await service.send({
        recipient: { deviceToken: 'device-token-123' },
        payload: {
          subject: 'Emergency Alert',
          body: 'This is urgent',
        },
        channel: NotificationChannel.PUSH,
        priority: 'high',
      });

      expect(result.success).toBe(true);
      expect(firebaseService.send).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: 'high',
        }),
      );
    });

    it('should default to normal priority', async () => {
      jest
        .spyOn(sendGridService, 'send')
        .mockResolvedValue(mockSuccessResponse);

      const result = await service.send({
        recipient: { email: 'user@example.com' },
        payload: {
          subject: 'Regular Update',
          body: 'This is a normal notification',
        },
        channel: NotificationChannel.EMAIL,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      jest
        .spyOn(sendGridService, 'send')
        .mockRejectedValue(new Error('Network error'));

      await expect(
        service.send({
          recipient: { email: 'user@example.com' },
          payload: { subject: 'Test', body: 'Test' },
          channel: NotificationChannel.EMAIL,
        }),
      ).rejects.toThrow('Network error');
    });

    it('should handle service unavailability', async () => {
      jest.spyOn(twilioService, 'send').mockResolvedValue({
        success: false,
        status: NotificationStatus.FAILED,
        error: 'Service temporarily unavailable',
      });

      const result = await service.sendSMS('+1234567890', 'Test message');

      expect(result.success).toBe(false);
      expect(result.error).toContain('unavailable');
    });

    it('should validate recipient information', async () => {
      await expect(
        service.send({
          recipient: {},
          payload: { subject: 'Test', body: 'Test' },
          channel: NotificationChannel.EMAIL,
        }),
      ).rejects.toThrow();
    });

    it('should validate channel selection', async () => {
      await expect(
        service.send({
          recipient: { email: 'user@example.com' },
          payload: { subject: 'Test', body: 'Test' },
          channel: 'invalid-channel' as any,
        }),
      ).rejects.toThrow();
    });
  });

  describe('Notification Metadata', () => {
    it('should include custom metadata in notifications', async () => {
      jest
        .spyOn(firebaseService, 'send')
        .mockResolvedValue(mockSuccessResponse);

      const customData = {
        orderId: '123',
        userId: 'user-456',
        notificationType: 'order_update',
      };

      const result = await service.send({
        recipient: { deviceToken: 'device-token-123' },
        payload: {
          subject: 'Order Update',
          body: 'Your order status changed',
          data: customData,
        },
        channel: NotificationChannel.PUSH,
      });

      expect(result.success).toBe(true);
      expect(firebaseService.send).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            data: customData,
          }),
        }),
      );
    });
  });
});
