import { Test, TestingModule } from "@nestjs/testing";
import { NotificationsService } from "../services/notifications.service";
import { SendGridService } from "../services/sendgrid.service";
import { TwilioService } from "../services/twilio.service";
import { FirebaseService } from "../services/firebase.service";
import { TemplateService } from "../services/template.service";
import {
  NotificationChannel,
  NotificationStatus,
} from "../interfaces/notification-provider.interface";

describe("NotificationsService", () => {
  let service: NotificationsService;
  let sendGridService: SendGridService;
  let twilioService: TwilioService;
  let firebaseService: FirebaseService;
  let templateService: TemplateService;

  const mockSuccessResponse = {
    success: true,
    messageId: "test-message-id",
    status: NotificationStatus.SENT,
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
            renderTemplate: jest.fn(),
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

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("send", () => {
    it("should send email notification", async () => {
      jest.spyOn(sendGridService, "send").mockResolvedValue(mockSuccessResponse);

      const result = await service.send({
        recipient: { email: "test@example.com" },
        payload: { subject: "Test", body: "Test message" },
        channel: NotificationChannel.EMAIL,
      });

      expect(result.success).toBe(true);
      expect(sendGridService.send).toHaveBeenCalled();
    });

    it("should send SMS notification", async () => {
      jest.spyOn(twilioService, "send").mockResolvedValue(mockSuccessResponse);

      const result = await service.send({
        recipient: { phone: "+1234567890" },
        payload: { body: "Test message" },
        channel: NotificationChannel.SMS,
      });

      expect(result.success).toBe(true);
      expect(twilioService.send).toHaveBeenCalled();
    });

    it("should send push notification", async () => {
      jest.spyOn(firebaseService, "send").mockResolvedValue(mockSuccessResponse);

      const result = await service.send({
        recipient: { deviceToken: "test-token" },
        payload: { subject: "Test", body: "Test message" },
        channel: NotificationChannel.PUSH,
      });

      expect(result.success).toBe(true);
      expect(firebaseService.send).toHaveBeenCalled();
    });

    it("should use template if templateId is provided", async () => {
      jest.spyOn(templateService, "renderTemplate").mockResolvedValue({
        subject: "Welcome John",
        body: "Hello John!",
      });
      jest.spyOn(sendGridService, "send").mockResolvedValue(mockSuccessResponse);

      const result = await service.send({
        recipient: { email: "test@example.com" },
        payload: { body: "" },
        channel: NotificationChannel.EMAIL,
        templateId: "template-id",
        variables: { name: "John" },
      });

      expect(templateService.renderTemplate).toHaveBeenCalledWith(
        "template-id",
        { name: "John" },
      );
      expect(result.success).toBe(true);
    });
  });

  describe("helper methods", () => {
    it("should send email using helper method", async () => {
      jest.spyOn(sendGridService, "send").mockResolvedValue(mockSuccessResponse);

      const result = await service.sendEmail(
        "test@example.com",
        "Test Subject",
        "Test Body",
      );

      expect(result.success).toBe(true);
      expect(sendGridService.send).toHaveBeenCalled();
    });

    it("should send SMS using helper method", async () => {
      jest.spyOn(twilioService, "send").mockResolvedValue(mockSuccessResponse);

      const result = await service.sendSMS("+1234567890", "Test message");

      expect(result.success).toBe(true);
      expect(twilioService.send).toHaveBeenCalled();
    });

    it("should send push notification using helper method", async () => {
      jest.spyOn(firebaseService, "send").mockResolvedValue(mockSuccessResponse);

      const result = await service.sendPush(
        "device-token",
        "Test Title",
        "Test Body",
      );

      expect(result.success).toBe(true);
      expect(firebaseService.send).toHaveBeenCalled();
    });
  });

  describe("sendMultiple", () => {
    it("should send multiple notifications", async () => {
      jest.spyOn(sendGridService, "send").mockResolvedValue(mockSuccessResponse);
      jest.spyOn(twilioService, "send").mockResolvedValue(mockSuccessResponse);

      const notifications = [
        {
          recipient: { email: "test@example.com" },
          payload: { body: "Test 1" },
          channel: NotificationChannel.EMAIL,
        },
        {
          recipient: { phone: "+1234567890" },
          payload: { body: "Test 2" },
          channel: NotificationChannel.SMS,
        },
      ];

      const results = await service.sendMultiple(notifications);

      expect(results).toHaveLength(2);
      expect(results.every((r) => r.success)).toBe(true);
    });
  });
});
