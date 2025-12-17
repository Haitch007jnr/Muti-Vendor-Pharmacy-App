import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { FirebaseService } from "../services/firebase.service";
import {
  NotificationChannel,
  NotificationStatus,
} from "../interfaces/notification-provider.interface";

// Mock Firebase Admin
jest.mock("firebase-admin", () => ({
  apps: [],
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
  },
  messaging: jest.fn(() => ({
    send: jest.fn(),
  })),
}));

describe("FirebaseService", () => {
  let service: FirebaseService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                FIREBASE_PROJECT_ID: "test-project-id",
                FIREBASE_PRIVATE_KEY: "test-private-key",
                FIREBASE_CLIENT_EMAIL: "test@test-project.iam.gserviceaccount.com",
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<FirebaseService>(FirebaseService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should return PUSH channel", () => {
    expect(service.getChannel()).toBe(NotificationChannel.PUSH);
  });

  it("should fail when device token is missing", async () => {
    const request = {
      recipient: { email: "test@example.com" },
      payload: { body: "Test message" },
      channel: NotificationChannel.PUSH,
    };

    const response = await service.send(request);

    expect(response.success).toBe(false);
    expect(response.status).toBe(NotificationStatus.FAILED);
    expect(response.error).toContain("device token is required");
  });
});
