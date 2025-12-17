import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { UnauthorizedException } from "@nestjs/common";
import { WebhookService } from "../services/webhook.service";
import { PaymentGatewayFactory } from "../services/payment-gateway.factory";
import { PaymentTransactionService } from "../services/payment-transaction.service";
import {
  PaymentGateway,
  PaymentStatus,
} from "../interfaces/payment-gateway.interface";
import * as crypto from "crypto";

describe("WebhookService", () => {
  let service: WebhookService;
  let configService: ConfigService;
  let paymentGatewayFactory: PaymentGatewayFactory;
  let paymentTransactionService: PaymentTransactionService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        PAYSTACK_SECRET_KEY: "test_secret_key",
        MONNIFY_SECRET_KEY: "test_secret_key",
      };
      return config[key];
    }),
  };

  const mockGatewayService = {
    handleWebhook: jest.fn(),
  };

  const mockPaymentGatewayFactory = {
    getGateway: jest.fn(() => mockGatewayService),
  };

  const mockPaymentTransactionService = {
    recordWebhookAttempt: jest.fn(),
    updateTransactionStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: PaymentGatewayFactory,
          useValue: mockPaymentGatewayFactory,
        },
        {
          provide: PaymentTransactionService,
          useValue: mockPaymentTransactionService,
        },
      ],
    }).compile();

    service = module.get<WebhookService>(WebhookService);
    configService = module.get<ConfigService>(ConfigService);
    paymentGatewayFactory = module.get<PaymentGatewayFactory>(
      PaymentGatewayFactory,
    );
    paymentTransactionService = module.get<PaymentTransactionService>(
      PaymentTransactionService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("verifyPaystackSignature", () => {
    it("should verify valid Paystack signature", () => {
      const payload = JSON.stringify({ event: "charge.success" });
      const secret = "test_secret_key";
      const signature = crypto
        .createHmac("sha512", secret)
        .update(payload)
        .digest("hex");

      const result = service.verifyPaystackSignature(payload, signature);

      expect(result).toBe(true);
    });

    it("should reject invalid Paystack signature", () => {
      const payload = JSON.stringify({ event: "charge.success" });
      const invalidSignature = "invalid_signature";

      const result = service.verifyPaystackSignature(payload, invalidSignature);

      expect(result).toBe(false);
    });
  });

  describe("verifyMonnifySignature", () => {
    it("should verify valid Monnify signature", () => {
      const payload = JSON.stringify({ event: "SUCCESSFUL_TRANSACTION" });
      const secret = "test_secret_key";
      const signature = crypto
        .createHmac("sha512", secret)
        .update(payload)
        .digest("hex");

      const result = service.verifyMonnifySignature(payload, signature);

      expect(result).toBe(true);
    });

    it("should reject invalid Monnify signature", () => {
      const payload = JSON.stringify({ event: "SUCCESSFUL_TRANSACTION" });
      const invalidSignature = "invalid_signature";

      const result = service.verifyMonnifySignature(payload, invalidSignature);

      expect(result).toBe(false);
    });
  });

  describe("handlePaystackWebhook", () => {
    const payload = {
      event: "charge.success",
      data: {
        reference: "PST-TEST-123",
        status: "success",
        amount: 1000000,
      },
    };

    it("should process valid Paystack webhook", async () => {
      const rawPayload = JSON.stringify(payload);
      const secret = "test_secret_key";
      const signature = crypto
        .createHmac("sha512", secret)
        .update(rawPayload)
        .digest("hex");

      mockGatewayService.handleWebhook.mockResolvedValue({
        event: "charge.success",
        reference: "PST-TEST-123",
        status: PaymentStatus.COMPLETED,
        message: "Payment successful",
      });

      mockPaymentTransactionService.recordWebhookAttempt.mockResolvedValue({});
      mockPaymentTransactionService.updateTransactionStatus.mockResolvedValue(
        {},
      );

      const result = await service.handlePaystackWebhook(
        payload,
        signature,
        rawPayload,
      );

      expect(result).toBeDefined();
      expect(result.reference).toBe("PST-TEST-123");
      expect(result.status).toBe(PaymentStatus.COMPLETED);
      expect(mockPaymentTransactionService.recordWebhookAttempt).toHaveBeenCalledWith(
        "PST-TEST-123",
      );
      expect(mockPaymentTransactionService.updateTransactionStatus).toHaveBeenCalled();
    });

    it("should reject webhook with invalid signature", async () => {
      const rawPayload = JSON.stringify(payload);
      const invalidSignature = "invalid_signature";

      await expect(
        service.handlePaystackWebhook(payload, invalidSignature, rawPayload),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should handle webhook processing errors gracefully", async () => {
      const rawPayload = JSON.stringify(payload);
      const secret = "test_secret_key";
      const signature = crypto
        .createHmac("sha512", secret)
        .update(rawPayload)
        .digest("hex");

      mockGatewayService.handleWebhook.mockResolvedValue({
        event: "charge.success",
        reference: "PST-TEST-123",
        status: PaymentStatus.COMPLETED,
        message: "Payment successful",
      });

      mockPaymentTransactionService.recordWebhookAttempt.mockRejectedValue(
        new Error("Database error"),
      );

      // Should not throw error even if database update fails
      const result = await service.handlePaystackWebhook(
        payload,
        signature,
        rawPayload,
      );

      expect(result).toBeDefined();
      expect(result.reference).toBe("PST-TEST-123");
    });
  });

  describe("handleMonnifyWebhook", () => {
    const payload = {
      event: "SUCCESSFUL_TRANSACTION",
      data: {
        paymentReference: "MNF-TEST-123",
        paymentStatus: "PAID",
        amountPaid: 10000,
      },
    };

    it("should process valid Monnify webhook", async () => {
      const rawPayload = JSON.stringify(payload);
      const secret = "test_secret_key";
      const signature = crypto
        .createHmac("sha512", secret)
        .update(rawPayload)
        .digest("hex");

      mockGatewayService.handleWebhook.mockResolvedValue({
        event: "SUCCESSFUL_TRANSACTION",
        reference: "MNF-TEST-123",
        status: PaymentStatus.COMPLETED,
        message: "Payment successful",
      });

      mockPaymentTransactionService.recordWebhookAttempt.mockResolvedValue({});
      mockPaymentTransactionService.updateTransactionStatus.mockResolvedValue(
        {},
      );

      const result = await service.handleMonnifyWebhook(
        payload,
        signature,
        rawPayload,
      );

      expect(result).toBeDefined();
      expect(result.reference).toBe("MNF-TEST-123");
      expect(result.status).toBe(PaymentStatus.COMPLETED);
      expect(mockPaymentTransactionService.recordWebhookAttempt).toHaveBeenCalledWith(
        "MNF-TEST-123",
      );
      expect(mockPaymentTransactionService.updateTransactionStatus).toHaveBeenCalled();
    });

    it("should reject webhook with invalid signature", async () => {
      const rawPayload = JSON.stringify(payload);
      const invalidSignature = "invalid_signature";

      await expect(
        service.handleMonnifyWebhook(payload, invalidSignature, rawPayload),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
