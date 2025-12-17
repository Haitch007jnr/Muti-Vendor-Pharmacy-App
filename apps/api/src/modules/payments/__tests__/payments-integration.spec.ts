import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from '../services/payments.service';
import { PaymentTransactionService } from '../services/payment-transaction.service';
import { PaymentGatewayFactory } from '../gateways/payment-gateway.factory';
import {
  PaymentGateway,
  PaymentStatus,
} from '../interfaces/payment-gateway.interface';

describe('PaymentsService - Integration Tests', () => {
  let service: PaymentsService;
  let transactionService: PaymentTransactionService;
  let gatewayFactory: PaymentGatewayFactory;

  const mockTransaction = {
    id: 'tx-123',
    reference: 'PST-1234567890',
    gateway: PaymentGateway.PAYSTACK,
    amount: 10000,
    currency: 'NGN',
    customerEmail: 'test@example.com',
    status: PaymentStatus.PENDING,
    userId: 'user-123',
    vendorId: 'vendor-123',
    orderId: 'order-123',
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: PaymentTransactionService,
          useValue: {
            createTransaction: jest.fn(),
            updateTransaction: jest.fn(),
            findByReference: jest.fn(),
            findAll: jest.fn(),
            getStatistics: jest.fn(),
          },
        },
        {
          provide: PaymentGatewayFactory,
          useValue: {
            getGateway: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                PAYSTACK_SECRET_KEY: 'sk_test_mock',
                MONNIFY_API_KEY: 'mock_api_key',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    transactionService = module.get<PaymentTransactionService>(
      PaymentTransactionService,
    );
    gatewayFactory = module.get<PaymentGatewayFactory>(PaymentGatewayFactory);
  });

  describe('Payment Initialization Flow', () => {
    it('should successfully initialize payment with Paystack', async () => {
      const mockGateway = {
        initializePayment: jest.fn().mockResolvedValue({
          success: true,
          reference: 'PST-1234567890',
          authorizationUrl: 'https://checkout.paystack.com/xyz',
          accessCode: 'xyz',
        }),
        verifyPayment: jest.fn(),
        refundPayment: jest.fn(),
      };

      jest.spyOn(gatewayFactory, 'getGateway').mockReturnValue(mockGateway);
      jest
        .spyOn(transactionService, 'createTransaction')
        .mockResolvedValue(mockTransaction as any);

      const result = await service.initializePayment(
        PaymentGateway.PAYSTACK,
        {
          amount: 10000,
          currency: 'NGN',
          email: 'test@example.com',
          metadata: { orderId: 'order-123' },
        },
        'user-123',
        'vendor-123',
        'order-123',
      );

      expect(result.success).toBe(true);
      expect(result.reference).toBe('PST-1234567890');
      expect(result.authorizationUrl).toBeDefined();
      expect(transactionService.createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          gateway: PaymentGateway.PAYSTACK,
          amount: 10000,
          currency: 'NGN',
          customerEmail: 'test@example.com',
        }),
      );
    });

    it('should successfully initialize payment with Monnify', async () => {
      const mockGateway = {
        initializePayment: jest.fn().mockResolvedValue({
          success: true,
          reference: 'MNF-1234567890',
          authorizationUrl: 'https://checkout.monnify.com/xyz',
        }),
        verifyPayment: jest.fn(),
        refundPayment: jest.fn(),
      };

      jest.spyOn(gatewayFactory, 'getGateway').mockReturnValue(mockGateway);
      jest.spyOn(transactionService, 'createTransaction').mockResolvedValue({
        ...mockTransaction,
        reference: 'MNF-1234567890',
        gateway: PaymentGateway.MONNIFY,
      } as any);

      const result = await service.initializePayment(
        PaymentGateway.MONNIFY,
        {
          amount: 15000,
          currency: 'NGN',
          email: 'test@example.com',
        },
        'user-123',
      );

      expect(result.success).toBe(true);
      expect(result.reference).toBe('MNF-1234567890');
      expect(mockGateway.initializePayment).toHaveBeenCalled();
    });

    it('should handle gateway initialization failure', async () => {
      const mockGateway = {
        initializePayment: jest
          .fn()
          .mockRejectedValue(new Error('Gateway connection failed')),
        verifyPayment: jest.fn(),
        refundPayment: jest.fn(),
      };

      jest.spyOn(gatewayFactory, 'getGateway').mockReturnValue(mockGateway);

      await expect(
        service.initializePayment(PaymentGateway.PAYSTACK, {
          amount: 10000,
          currency: 'NGN',
          email: 'test@example.com',
        }),
      ).rejects.toThrow('Gateway connection failed');
    });

    it('should validate payment amount', async () => {
      await expect(
        service.initializePayment(PaymentGateway.PAYSTACK, {
          amount: -1000,
          currency: 'NGN',
          email: 'test@example.com',
        }),
      ).rejects.toThrow();
    });

    it('should validate email format', async () => {
      await expect(
        service.initializePayment(PaymentGateway.PAYSTACK, {
          amount: 10000,
          currency: 'NGN',
          email: 'invalid-email',
        }),
      ).rejects.toThrow();
    });
  });

  describe('Payment Verification Flow', () => {
    it('should successfully verify completed payment', async () => {
      const mockGateway = {
        initializePayment: jest.fn(),
        verifyPayment: jest.fn().mockResolvedValue({
          success: true,
          reference: 'PST-1234567890',
          amount: 10000,
          currency: 'NGN',
          status: PaymentStatus.COMPLETED,
          paidAt: new Date(),
          metadata: {},
        }),
        refundPayment: jest.fn(),
      };

      jest.spyOn(gatewayFactory, 'getGateway').mockReturnValue(mockGateway);
      jest
        .spyOn(transactionService, 'findByReference')
        .mockResolvedValue(mockTransaction as any);
      jest
        .spyOn(transactionService, 'updateTransaction')
        .mockResolvedValue({
          ...mockTransaction,
          status: PaymentStatus.COMPLETED,
        } as any);

      const result = await service.verifyPayment(
        PaymentGateway.PAYSTACK,
        'PST-1234567890',
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe(PaymentStatus.COMPLETED);
      expect(transactionService.updateTransaction).toHaveBeenCalledWith(
        'PST-1234567890',
        expect.objectContaining({
          status: PaymentStatus.COMPLETED,
        }),
      );
    });

    it('should handle failed payment verification', async () => {
      const mockGateway = {
        initializePayment: jest.fn(),
        verifyPayment: jest.fn().mockResolvedValue({
          success: false,
          reference: 'PST-1234567890',
          status: PaymentStatus.FAILED,
          failureReason: 'Insufficient funds',
        }),
        refundPayment: jest.fn(),
      };

      jest.spyOn(gatewayFactory, 'getGateway').mockReturnValue(mockGateway);
      jest
        .spyOn(transactionService, 'findByReference')
        .mockResolvedValue(mockTransaction as any);
      jest.spyOn(transactionService, 'updateTransaction').mockResolvedValue({
        ...mockTransaction,
        status: PaymentStatus.FAILED,
      } as any);

      const result = await service.verifyPayment(
        PaymentGateway.PAYSTACK,
        'PST-1234567890',
      );

      expect(result.success).toBe(false);
      expect(result.status).toBe(PaymentStatus.FAILED);
    });

    it('should handle non-existent transaction', async () => {
      jest
        .spyOn(transactionService, 'findByReference')
        .mockResolvedValue(null);

      await expect(
        service.verifyPayment(PaymentGateway.PAYSTACK, 'NON-EXISTENT'),
      ).rejects.toThrow('Transaction not found');
    });
  });

  describe('Payment Refund Flow', () => {
    it('should successfully process full refund', async () => {
      const mockGateway = {
        initializePayment: jest.fn(),
        verifyPayment: jest.fn(),
        refundPayment: jest.fn().mockResolvedValue({
          success: true,
          refundReference: 'REF-123',
          amount: 10000,
        }),
      };

      const completedTransaction = {
        ...mockTransaction,
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
      };

      jest.spyOn(gatewayFactory, 'getGateway').mockReturnValue(mockGateway);
      jest
        .spyOn(transactionService, 'findByReference')
        .mockResolvedValue(completedTransaction as any);
      jest.spyOn(transactionService, 'updateTransaction').mockResolvedValue({
        ...completedTransaction,
        status: PaymentStatus.REFUNDED,
        refundedAmount: 10000,
      } as any);

      const result = await service.refundPayment(PaymentGateway.PAYSTACK, {
        reference: 'PST-1234567890',
        reason: 'Customer request',
      });

      expect(result.success).toBe(true);
      expect(mockGateway.refundPayment).toHaveBeenCalledWith({
        reference: 'PST-1234567890',
        amount: 10000,
        reason: 'Customer request',
      });
    });

    it('should successfully process partial refund', async () => {
      const mockGateway = {
        initializePayment: jest.fn(),
        verifyPayment: jest.fn(),
        refundPayment: jest.fn().mockResolvedValue({
          success: true,
          refundReference: 'REF-123',
          amount: 5000,
        }),
      };

      const completedTransaction = {
        ...mockTransaction,
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
      };

      jest.spyOn(gatewayFactory, 'getGateway').mockReturnValue(mockGateway);
      jest
        .spyOn(transactionService, 'findByReference')
        .mockResolvedValue(completedTransaction as any);
      jest.spyOn(transactionService, 'updateTransaction').mockResolvedValue({
        ...completedTransaction,
        refundedAmount: 5000,
      } as any);

      const result = await service.refundPayment(PaymentGateway.PAYSTACK, {
        reference: 'PST-1234567890',
        amount: 5000,
        reason: 'Partial refund',
      });

      expect(result.success).toBe(true);
      expect(mockGateway.refundPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 5000,
        }),
      );
    });

    it('should reject refund for non-completed payment', async () => {
      jest
        .spyOn(transactionService, 'findByReference')
        .mockResolvedValue(mockTransaction as any);

      await expect(
        service.refundPayment(PaymentGateway.PAYSTACK, {
          reference: 'PST-1234567890',
          reason: 'Customer request',
        }),
      ).rejects.toThrow('Cannot refund payment that is not completed');
    });
  });

  describe('Payment Statistics', () => {
    it('should retrieve payment statistics', async () => {
      const mockStats = {
        totalTransactions: 100,
        successfulTransactions: 95,
        failedTransactions: 3,
        pendingTransactions: 2,
        totalAmount: 1000000,
        totalRefunded: 50000,
        reconciledCount: 90,
        unreconciledCount: 5,
      };

      jest
        .spyOn(transactionService, 'getStatistics')
        .mockResolvedValue(mockStats);

      const result = await service.getStatistics('vendor-123');

      expect(result).toEqual(mockStats);
      expect(transactionService.getStatistics).toHaveBeenCalledWith(
        'vendor-123',
      );
    });
  });

  describe('Transaction Reconciliation', () => {
    it('should successfully reconcile transaction', async () => {
      const completedTransaction = {
        ...mockTransaction,
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
        reconciled: false,
      };

      jest
        .spyOn(transactionService, 'findByReference')
        .mockResolvedValue(completedTransaction as any);
      jest.spyOn(transactionService, 'updateTransaction').mockResolvedValue({
        ...completedTransaction,
        reconciled: true,
        reconciledAt: new Date(),
      } as any);

      const result = await service.reconcilePayment(
        PaymentGateway.PAYSTACK,
        'PST-1234567890',
        'user-456',
        'Reconciled manually',
      );

      expect(result.success).toBe(true);
      expect(transactionService.updateTransaction).toHaveBeenCalledWith(
        'PST-1234567890',
        expect.objectContaining({
          reconciled: true,
          reconciledBy: 'user-456',
        }),
      );
    });

    it('should reject reconciliation of already reconciled transaction', async () => {
      const reconciledTransaction = {
        ...mockTransaction,
        status: PaymentStatus.COMPLETED,
        reconciled: true,
        reconciledAt: new Date(),
      };

      jest
        .spyOn(transactionService, 'findByReference')
        .mockResolvedValue(reconciledTransaction as any);

      await expect(
        service.reconcilePayment(
          PaymentGateway.PAYSTACK,
          'PST-1234567890',
          'user-456',
        ),
      ).rejects.toThrow('Transaction already reconciled');
    });
  });
});
