import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { SendGridService } from "../services/sendgrid.service";
import {
  NotificationChannel,
  NotificationStatus,
} from "../interfaces/notification-provider.interface";

// Mock SendGrid
jest.mock("@sendgrid/mail", () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}));

describe("SendGridService", () => {
  let service: SendGridService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendGridService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                SENDGRID_API_KEY: "test_api_key",
                SENDGRID_FROM_EMAIL: "test@example.com",
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<SendGridService>(SendGridService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should return EMAIL channel", () => {
    expect(service.getChannel()).toBe(NotificationChannel.EMAIL);
  });

  it("should fail when recipient email is missing", async () => {
    const request = {
      recipient: { phone: "+1234567890" },
      payload: { body: "Test message" },
      channel: NotificationChannel.EMAIL,
    };

    const response = await service.send(request);

    expect(response.success).toBe(false);
    expect(response.status).toBe(NotificationStatus.FAILED);
    expect(response.error).toContain("email is required");
  });
});
