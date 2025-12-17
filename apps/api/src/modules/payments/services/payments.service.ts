import { Injectable, Logger } from "@nestjs/common";
import { PaymentGatewayFactory } from "./payment-gateway.factory";
import { PaymentTransactionService } from "./payment-transaction.service";
import {
  PaymentGateway,
  InitializePaymentRequest,
  InitializePaymentResponse,
  VerifyPaymentResponse,
  RefundPaymentRequest,
  RefundPaymentResponse,
  PaymentStatus,
} from "../interfaces/payment-gateway.interface";
import { PaymentTransaction } from "../entities/payment-transaction.entity";

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly paymentGatewayFactory: PaymentGatewayFactory,
    private readonly paymentTransactionService: PaymentTransactionService,
  ) {}

  async initializePayment(
    gateway: PaymentGateway,
    request: InitializePaymentRequest,
    userId?: string,
    vendorId?: string,
    orderId?: string,
  ): Promise<InitializePaymentResponse> {
    this.logger.log(`Initializing payment with ${gateway}`);

    const gatewayService = this.paymentGatewayFactory.getGateway(gateway);

    // Generate reference if not provided
    if (!request.reference) {
      request.reference = this.generateReference(gateway);
    }

    const response = await gatewayService.initializePayment(request);

    // Save transaction to database
    await this.paymentTransactionService.createTransaction(
      gateway,
      request,
      response,
      userId,
      vendorId,
      orderId,
    );

    return response;
  }

  async verifyPayment(
    gateway: PaymentGateway,
    reference: string,
  ): Promise<VerifyPaymentResponse> {
    this.logger.log(`Verifying payment with ${gateway}: ${reference}`);

    const gatewayService = this.paymentGatewayFactory.getGateway(gateway);

    const verificationResult = await gatewayService.verifyPayment(reference);

    // Update transaction status in database
    await this.paymentTransactionService.updateTransactionStatus(
      reference,
      verificationResult.status,
      verificationResult,
      verificationResult.paidAt,
    );

    return verificationResult;
  }

  async refundPayment(
    gateway: PaymentGateway,
    request: RefundPaymentRequest,
  ): Promise<RefundPaymentResponse> {
    this.logger.log(`Processing refund with ${gateway}: ${request.reference}`);

    const gatewayService = this.paymentGatewayFactory.getGateway(gateway);

    const refundResult = await gatewayService.refundPayment(request);

    // Update transaction with refund information
    if (refundResult.success) {
      await this.paymentTransactionService.recordRefund(
        request.reference,
        refundResult.amount,
        refundResult.refundReference,
        request.reason,
      );
    }

    return refundResult;
  }

  async reconcilePayment(
    gateway: PaymentGateway,
    reference: string,
    reconciledBy: string,
  ): Promise<PaymentTransaction> {
    this.logger.log(`Reconciling payment ${reference}`);

    // First verify the payment with the gateway
    await this.verifyPayment(gateway, reference);

    // Then mark as reconciled
    return this.paymentTransactionService.reconcilePayment(
      reference,
      reconciledBy,
    );
  }

  async getTransactionByReference(
    reference: string,
  ): Promise<PaymentTransaction> {
    return this.paymentTransactionService.findByReference(reference);
  }

  async getAllTransactions(filters?: {
    gateway?: PaymentGateway;
    status?: PaymentStatus;
    userId?: string;
    vendorId?: string;
    reconciled?: boolean;
  }): Promise<PaymentTransaction[]> {
    return this.paymentTransactionService.findAll(filters);
  }

  async getPaymentStats(vendorId?: string) {
    return this.paymentTransactionService.getPaymentStats(vendorId);
  }

  private generateReference(gateway: PaymentGateway): string {
    const prefix = gateway === PaymentGateway.PAYSTACK ? "PST" : "MNF";
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11).toUpperCase();

    return `${prefix}-${timestamp}-${random}`;
  }
}
