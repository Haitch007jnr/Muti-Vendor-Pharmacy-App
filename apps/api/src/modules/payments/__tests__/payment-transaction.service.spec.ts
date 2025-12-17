import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { PaymentTransactionService } from "../services/payment-transaction.service";
import { PaymentTransaction } from "../entities/payment-transaction.entity";
import {
  PaymentGateway,
  PaymentStatus,
} from "../interfaces/payment-gateway.interface";

describe("PaymentTransactionService", () => {
  let service: PaymentTransactionService;
  let repository: Repository<PaymentTransaction>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentTransactionService,
        {
          provide: getRepositoryToken(PaymentTransaction),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PaymentTransactionService>(
      PaymentTransactionService,
    );
    repository = module.get<Repository<PaymentTransaction>>(
      getRepositoryToken(PaymentTransaction),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createTransaction", () => {
    it("should create a payment transaction", async () => {
      const mockTransaction = {
        id: "uuid-123",
        reference: "PST-123",
        gateway: PaymentGateway.PAYSTACK,
        amount: 10000,
        currency: "NGN",
        customerEmail: "test@example.com",
        status: PaymentStatus.PENDING,
      };

      mockRepository.create.mockReturnValue(mockTransaction);
      mockRepository.save.mockResolvedValue(mockTransaction);

      const result = await service.createTransaction(
        PaymentGateway.PAYSTACK,
        {
          amount: 10000,
          currency: "NGN",
          email: "test@example.com",
        },
        {
          success: true,
          reference: "PST-123",
          authorizationUrl: "https://checkout.paystack.com/xyz",
        },
      );

      expect(result).toBeDefined();
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe("findByReference", () => {
    it("should find a transaction by reference", async () => {
      const mockTransaction = {
        id: "uuid-123",
        reference: "PST-123",
        status: PaymentStatus.PENDING,
      };

      mockRepository.findOne.mockResolvedValue(mockTransaction);

      const result = await service.findByReference("PST-123");

      expect(result).toEqual(mockTransaction);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { reference: "PST-123" },
      });
    });

    it("should throw NotFoundException if transaction not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findByReference("INVALID-REF")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("updateTransactionStatus", () => {
    it("should update transaction status", async () => {
      const mockTransaction = {
        id: "uuid-123",
        reference: "PST-123",
        status: PaymentStatus.PENDING,
      };

      const updatedTransaction = {
        ...mockTransaction,
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockTransaction);
      mockRepository.save.mockResolvedValue(updatedTransaction);

      const result = await service.updateTransactionStatus(
        "PST-123",
        PaymentStatus.COMPLETED,
        {},
        new Date(),
      );

      expect(result.status).toBe(PaymentStatus.COMPLETED);
      expect(result.paidAt).toBeDefined();
    });
  });

  describe("recordWebhookAttempt", () => {
    it("should increment webhook attempts", async () => {
      const mockTransaction = {
        id: "uuid-123",
        reference: "PST-123",
        webhookAttempts: 0,
      };

      mockRepository.findOne.mockResolvedValue(mockTransaction);
      mockRepository.save.mockResolvedValue({
        ...mockTransaction,
        webhookAttempts: 1,
        lastWebhookAt: new Date(),
      });

      const result = await service.recordWebhookAttempt("PST-123");

      expect(result.webhookAttempts).toBe(1);
      expect(result.lastWebhookAt).toBeDefined();
    });
  });

  describe("recordRefund", () => {
    it("should record a refund", async () => {
      const mockTransaction = {
        id: "uuid-123",
        reference: "PST-123",
        status: PaymentStatus.COMPLETED,
        amount: 10000,
      };

      mockRepository.findOne.mockResolvedValue(mockTransaction);
      mockRepository.save.mockResolvedValue({
        ...mockTransaction,
        status: PaymentStatus.REFUNDED,
        refundedAmount: 10000,
        refundReference: "REF-123",
        refundedAt: new Date(),
      });

      const result = await service.recordRefund(
        "PST-123",
        10000,
        "REF-123",
        "Customer request",
      );

      expect(result.status).toBe(PaymentStatus.REFUNDED);
      expect(result.refundedAmount).toBe(10000);
      expect(result.refundReference).toBe("REF-123");
    });

    it("should throw error if payment not completed", async () => {
      const mockTransaction = {
        id: "uuid-123",
        reference: "PST-123",
        status: PaymentStatus.PENDING,
      };

      mockRepository.findOne.mockResolvedValue(mockTransaction);

      await expect(
        service.recordRefund("PST-123", 10000, "REF-123"),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("reconcilePayment", () => {
    it("should reconcile a payment", async () => {
      const mockTransaction = {
        id: "uuid-123",
        reference: "PST-123",
        status: PaymentStatus.COMPLETED,
        reconciled: false,
      };

      mockRepository.findOne.mockResolvedValue(mockTransaction);
      mockRepository.save.mockResolvedValue({
        ...mockTransaction,
        reconciled: true,
        reconciledAt: new Date(),
        reconciledBy: "user-123",
      });

      const result = await service.reconcilePayment("PST-123", "user-123");

      expect(result.reconciled).toBe(true);
      expect(result.reconciledBy).toBe("user-123");
      expect(result.reconciledAt).toBeDefined();
    });

    it("should throw error if payment already reconciled", async () => {
      const mockTransaction = {
        id: "uuid-123",
        reference: "PST-123",
        status: PaymentStatus.COMPLETED,
        reconciled: true,
      };

      mockRepository.findOne.mockResolvedValue(mockTransaction);

      await expect(
        service.reconcilePayment("PST-123", "user-123"),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw error if payment not completed", async () => {
      const mockTransaction = {
        id: "uuid-123",
        reference: "PST-123",
        status: PaymentStatus.PENDING,
        reconciled: false,
      };

      mockRepository.findOne.mockResolvedValue(mockTransaction);

      await expect(
        service.reconcilePayment("PST-123", "user-123"),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("getPaymentStats", () => {
    it("should calculate payment statistics", async () => {
      const mockTransactions = [
        {
          status: PaymentStatus.COMPLETED,
          amount: 10000,
          reconciled: true,
        },
        {
          status: PaymentStatus.COMPLETED,
          amount: 5000,
          reconciled: false,
        },
        { status: PaymentStatus.FAILED, amount: 3000, reconciled: false },
        { status: PaymentStatus.PENDING, amount: 2000, reconciled: false },
        {
          status: PaymentStatus.REFUNDED,
          refundedAmount: 1000,
          reconciled: false,
        },
      ];

      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockTransactions),
      };

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const stats = await service.getPaymentStats();

      expect(stats.totalTransactions).toBe(5);
      expect(stats.successfulTransactions).toBe(2);
      expect(stats.failedTransactions).toBe(1);
      expect(stats.pendingTransactions).toBe(1);
      expect(stats.totalAmount).toBe(15000);
      expect(stats.totalRefunded).toBe(1000);
      expect(stats.reconciledCount).toBe(1);
      expect(stats.unreconciledCount).toBe(1);
    });
  });
});
