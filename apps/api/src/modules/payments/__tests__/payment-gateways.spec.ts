import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { PaystackService } from "../gateways/paystack.service";
import { MonnifyService } from "../gateways/monnify.service";
import {
  PaymentGateway,
  PaymentStatus,
} from "../interfaces/payment-gateway.interface";

describe("Payment Gateway Services", () => {
  let paystackService: PaystackService;
  let monnifyService: MonnifyService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaystackService,
        MonnifyService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                PAYSTACK_SECRET_KEY: "sk_test_mock_key",
                MONNIFY_API_KEY: "mock_api_key",
                MONNIFY_SECRET_KEY: "mock_secret_key",
                MONNIFY_CONTRACT_CODE: "mock_contract_code",
                MONNIFY_BASE_URL: "https://sandbox.monnify.com",
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    paystackService = module.get<PaystackService>(PaystackService);
    monnifyService = module.get<MonnifyService>(MonnifyService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe("PaystackService", () => {
    it("should be defined", () => {
      expect(paystackService).toBeDefined();
    });

    it("should map Paystack status correctly", () => {
      const statusMap = {
        success: PaymentStatus.COMPLETED,
        failed: PaymentStatus.FAILED,
        pending: PaymentStatus.PENDING,
        abandoned: PaymentStatus.FAILED,
      };

      Object.entries(statusMap).forEach(([paystackStatus, expectedStatus]) => {
        const result = (paystackService as any).mapPaystackStatus(
          paystackStatus,
        );
        expect(result).toBe(expectedStatus);
      });
    });

    it("should handle webhook events", async () => {
      const payload = {
        event: "charge.success",
        data: {
          reference: "PST-TEST-123",
          status: "success",
          amount: 1000000,
          currency: "NGN",
        },
      };

      const result = await paystackService.handleWebhook(payload);

      expect(result).toBeDefined();
      expect(result.event).toBe("charge.success");
      expect(result.reference).toBe("PST-TEST-123");
      expect(result.status).toBe(PaymentStatus.COMPLETED);
    });

    it("should handle failed payment webhook", async () => {
      const payload = {
        event: "charge.failed",
        data: {
          reference: "PST-TEST-456",
          status: "failed",
        },
      };

      const result = await paystackService.handleWebhook(payload);

      expect(result.status).toBe(PaymentStatus.FAILED);
      expect(result.message).toContain("failed");
    });
  });

  describe("MonnifyService", () => {
    it("should be defined", () => {
      expect(monnifyService).toBeDefined();
    });

    it("should map Monnify status correctly", () => {
      const statusMap = {
        PAID: PaymentStatus.COMPLETED,
        FAILED: PaymentStatus.FAILED,
        PENDING: PaymentStatus.PENDING,
        EXPIRED: PaymentStatus.FAILED,
        CANCELLED: PaymentStatus.FAILED,
      };

      Object.entries(statusMap).forEach(([monnifyStatus, expectedStatus]) => {
        const result = (monnifyService as any).mapMonnifyStatus(
          monnifyStatus,
        );
        expect(result).toBe(expectedStatus);
      });
    });

    it("should generate valid payment reference", () => {
      const reference = (monnifyService as any).generateReference();

      expect(reference).toBeDefined();
      expect(reference).toMatch(/^MNF-\d+-[a-z0-9]+$/);
    });

    it("should handle webhook events", async () => {
      const payload = {
        event: "SUCCESSFUL_TRANSACTION",
        data: {
          paymentReference: "MNF-TEST-123",
          paymentStatus: "PAID",
          amountPaid: 10000,
        },
      };

      const result = await monnifyService.handleWebhook(payload);

      expect(result).toBeDefined();
      expect(result.event).toBe("SUCCESSFUL_TRANSACTION");
      expect(result.reference).toBe("MNF-TEST-123");
      expect(result.status).toBe(PaymentStatus.COMPLETED);
    });

    it("should handle failed transaction webhook", async () => {
      const payload = {
        event: "FAILED_TRANSACTION",
        data: {
          paymentReference: "MNF-TEST-456",
          paymentStatus: "FAILED",
        },
      };

      const result = await monnifyService.handleWebhook(payload);

      expect(result.status).toBe(PaymentStatus.FAILED);
      expect(result.message).toContain("failed");
    });
  });
});
