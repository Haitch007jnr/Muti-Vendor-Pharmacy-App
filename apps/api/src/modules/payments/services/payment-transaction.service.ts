import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PaymentTransaction } from "../entities/payment-transaction.entity";
import {
  PaymentGateway,
  PaymentStatus,
  InitializePaymentRequest,
  InitializePaymentResponse,
} from "../interfaces/payment-gateway.interface";

@Injectable()
export class PaymentTransactionService {
  private readonly logger = new Logger(PaymentTransactionService.name);

  constructor(
    @InjectRepository(PaymentTransaction)
    private readonly paymentTransactionRepository: Repository<PaymentTransaction>,
  ) {}

  async createTransaction(
    gateway: PaymentGateway,
    request: InitializePaymentRequest,
    response: InitializePaymentResponse,
    userId?: string,
    vendorId?: string,
    orderId?: string,
  ): Promise<PaymentTransaction> {
    const transaction = this.paymentTransactionRepository.create({
      reference: response.reference,
      gateway,
      amount: request.amount,
      currency: request.currency || "NGN",
      customerEmail: request.email,
      status: PaymentStatus.PENDING,
      authorizationUrl: response.authorizationUrl,
      accessCode: response.accessCode,
      userId,
      vendorId,
      orderId,
      metadata: request.metadata,
      callbackUrl: request.callbackUrl,
    });

    return this.paymentTransactionRepository.save(transaction);
  }

  async findByReference(reference: string): Promise<PaymentTransaction> {
    const transaction = await this.paymentTransactionRepository.findOne({
      where: { reference },
    });

    if (!transaction) {
      throw new NotFoundException(
        `Payment transaction with reference ${reference} not found`,
      );
    }

    return transaction;
  }

  async updateTransactionStatus(
    reference: string,
    status: PaymentStatus,
    gatewayResponse?: Record<string, any>,
    paidAt?: Date,
    failureReason?: string,
  ): Promise<PaymentTransaction> {
    const transaction = await this.findByReference(reference);

    transaction.status = status;
    transaction.gatewayResponse = gatewayResponse || transaction.gatewayResponse;

    if (paidAt) {
      transaction.paidAt = paidAt;
    }

    if (failureReason) {
      transaction.failureReason = failureReason;
    }

    return this.paymentTransactionRepository.save(transaction);
  }

  async recordWebhookAttempt(reference: string): Promise<PaymentTransaction> {
    const transaction = await this.findByReference(reference);

    transaction.webhookAttempts += 1;
    transaction.lastWebhookAt = new Date();

    return this.paymentTransactionRepository.save(transaction);
  }

  async recordRefund(
    reference: string,
    refundAmount: number,
    refundReference: string,
    refundReason?: string,
  ): Promise<PaymentTransaction> {
    const transaction = await this.findByReference(reference);

    if (transaction.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException(
        "Cannot refund a payment that is not completed",
      );
    }

    transaction.status = PaymentStatus.REFUNDED;
    transaction.refundedAmount = refundAmount;
    transaction.refundReference = refundReference;
    transaction.refundReason = refundReason;
    transaction.refundedAt = new Date();

    return this.paymentTransactionRepository.save(transaction);
  }

  async reconcilePayment(
    reference: string,
    reconciledBy: string,
  ): Promise<PaymentTransaction> {
    const transaction = await this.findByReference(reference);

    if (transaction.reconciled) {
      throw new BadRequestException("Payment is already reconciled");
    }

    if (transaction.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException(
        "Cannot reconcile a payment that is not completed",
      );
    }

    transaction.reconciled = true;
    transaction.reconciledAt = new Date();
    transaction.reconciledBy = reconciledBy;

    return this.paymentTransactionRepository.save(transaction);
  }

  async findAll(filters?: {
    gateway?: PaymentGateway;
    status?: PaymentStatus;
    userId?: string;
    vendorId?: string;
    reconciled?: boolean;
  }): Promise<PaymentTransaction[]> {
    const query = this.paymentTransactionRepository.createQueryBuilder("pt");

    if (filters?.gateway) {
      query.andWhere("pt.gateway = :gateway", { gateway: filters.gateway });
    }

    if (filters?.status) {
      query.andWhere("pt.status = :status", { status: filters.status });
    }

    if (filters?.userId) {
      query.andWhere("pt.user_id = :userId", { userId: filters.userId });
    }

    if (filters?.vendorId) {
      query.andWhere("pt.vendor_id = :vendorId", {
        vendorId: filters.vendorId,
      });
    }

    if (filters?.reconciled !== undefined) {
      query.andWhere("pt.reconciled = :reconciled", {
        reconciled: filters.reconciled,
      });
    }

    query.orderBy("pt.created_at", "DESC");

    return query.getMany();
  }

  async getPaymentStats(vendorId?: string): Promise<{
    totalTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;
    pendingTransactions: number;
    totalAmount: number;
    totalRefunded: number;
    reconciledCount: number;
    unreconciledCount: number;
  }> {
    const query = this.paymentTransactionRepository.createQueryBuilder("pt");

    if (vendorId) {
      query.where("pt.vendor_id = :vendorId", { vendorId });
    }

    const transactions = await query.getMany();

    const stats = {
      totalTransactions: transactions.length,
      successfulTransactions: transactions.filter(
        (t) => t.status === PaymentStatus.COMPLETED,
      ).length,
      failedTransactions: transactions.filter(
        (t) => t.status === PaymentStatus.FAILED,
      ).length,
      pendingTransactions: transactions.filter(
        (t) => t.status === PaymentStatus.PENDING,
      ).length,
      totalAmount: transactions
        .filter((t) => t.status === PaymentStatus.COMPLETED)
        .reduce((sum, t) => sum + Number(t.amount), 0),
      totalRefunded: transactions
        .filter((t) => t.status === PaymentStatus.REFUNDED)
        .reduce((sum, t) => sum + Number(t.refundedAmount), 0),
      reconciledCount: transactions.filter((t) => t.reconciled).length,
      unreconciledCount: transactions.filter(
        (t) => !t.reconciled && t.status === PaymentStatus.COMPLETED,
      ).length,
    };

    return stats;
  }
}
