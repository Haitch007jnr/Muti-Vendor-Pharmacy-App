import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { TwilioService } from "../services/twilio.service";
import {
  NotificationChannel,
  NotificationStatus,
} from "../interfaces/notification-provider.interface";

// Mock Twilio - must be a constructor function
const mockTwilioClient = {
  messages: {
    create: jest.fn(),
  },
};

jest.mock("twilio", () => {
  return {
    Twilio: jest.fn().mockImplementation(() => mockTwilioClient),
  };
});

describe("TwilioService", () => {
  let service: TwilioService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwilioService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                TWILIO_ACCOUNT_SID: "test_account_sid",
                TWILIO_AUTH_TOKEN: "test_auth_token",
                TWILIO_PHONE_NUMBER: "+1234567890",
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<TwilioService>(TwilioService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should return SMS channel", () => {
    expect(service.getChannel()).toBe(NotificationChannel.SMS);
  });

  it("should fail when recipient phone is missing", async () => {
    const request = {
      recipient: { email: "test@example.com" },
      payload: { body: "Test message" },
      channel: NotificationChannel.SMS,
    };

    const response = await service.send(request);

    expect(response.success).toBe(false);
    expect(response.status).toBe(NotificationStatus.FAILED);
    expect(response.error).toContain("phone number is required");
  });
});
