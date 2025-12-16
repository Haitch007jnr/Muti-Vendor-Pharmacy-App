import { Injectable, Logger } from '@nestjs/common';
import { PaymentGatewayFactory } from './payment-gateway.factory';
import {
  PaymentGateway,
  InitializePaymentRequest,
  InitializePaymentResponse,
  VerifyPaymentResponse,
  RefundPaymentRequest,
  RefundPaymentResponse,
} from '../interfaces/payment-gateway.interface';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly paymentGatewayFactory: PaymentGatewayFactory,
  ) {}

  async initializePayment(
    gateway: PaymentGateway,
    request: InitializePaymentRequest,
  ): Promise<InitializePaymentResponse> {
    this.logger.log(`Initializing payment with ${gateway}`);
    
    const gatewayService = this.paymentGatewayFactory.getGateway(gateway);
    
    // Generate reference if not provided
    if (!request.reference) {
      request.reference = this.generateReference(gateway);
    }

    return gatewayService.initializePayment(request);
  }

  async verifyPayment(
    gateway: PaymentGateway,
    reference: string,
  ): Promise<VerifyPaymentResponse> {
    this.logger.log(`Verifying payment with ${gateway}: ${reference}`);
    
    const gatewayService = this.paymentGatewayFactory.getGateway(gateway);
    
    return gatewayService.verifyPayment(reference);
  }

  async refundPayment(
    gateway: PaymentGateway,
    request: RefundPaymentRequest,
  ): Promise<RefundPaymentResponse> {
    this.logger.log(`Processing refund with ${gateway}: ${request.reference}`);
    
    const gatewayService = this.paymentGatewayFactory.getGateway(gateway);
    
    return gatewayService.refundPayment(request);
  }

  private generateReference(gateway: PaymentGateway): string {
    const prefix = gateway === PaymentGateway.PAYSTACK ? 'PST' : 'MNF';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11).toUpperCase();
    
    return `${prefix}-${timestamp}-${random}`;
  }
}
