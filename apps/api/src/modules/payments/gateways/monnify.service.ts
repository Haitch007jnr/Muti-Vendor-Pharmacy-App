import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  IPaymentGateway,
  InitializePaymentRequest,
  InitializePaymentResponse,
  VerifyPaymentResponse,
  RefundPaymentRequest,
  RefundPaymentResponse,
  PaymentWebhookPayload,
  PaymentStatus,
} from '../interfaces/payment-gateway.interface';

@Injectable()
export class MonnifyService implements IPaymentGateway {
  private readonly logger = new Logger(MonnifyService.name);
  private readonly client: AxiosInstance;
  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly contractCode: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('MONNIFY_API_KEY');
    this.secretKey = this.configService.get<string>('MONNIFY_SECRET_KEY');
    this.contractCode = this.configService.get<string>('MONNIFY_CONTRACT_CODE');
    this.baseUrl = this.configService.get<string>('MONNIFY_BASE_URL') || 'https://sandbox.monnify.com';

    if (!this.apiKey || !this.secretKey || !this.contractCode) {
      throw new Error('Monnify credentials are not properly configured');
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private async getAccessToken(): Promise<string> {
    try {
      const credentials = Buffer.from(`${this.apiKey}:${this.secretKey}`).toString('base64');
      
      const response = await this.client.post('/api/v1/auth/login', null, {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });

      if (response.data.requestSuccessful) {
        return response.data.responseBody.accessToken;
      }

      throw new Error('Failed to get Monnify access token');
    } catch (error) {
      this.logger.error('Monnify authentication error:', error.message);
      throw new BadRequestException('Failed to authenticate with Monnify');
    }
  }

  async initializePayment(
    request: InitializePaymentRequest,
  ): Promise<InitializePaymentResponse> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await this.client.post(
        '/api/v1/merchant/transactions/init-transaction',
        {
          amount: request.amount,
          customerName: request.email,
          customerEmail: request.email,
          paymentReference: request.reference || this.generateReference(),
          paymentDescription: 'Payment for order',
          currencyCode: request.currency || 'NGN',
          contractCode: this.contractCode,
          redirectUrl: request.callbackUrl,
          paymentMethods: ['CARD', 'ACCOUNT_TRANSFER'],
          metadata: request.metadata,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.data.requestSuccessful) {
        const data = response.data.responseBody;
        return {
          success: true,
          reference: data.paymentReference,
          authorizationUrl: data.checkoutUrl,
        };
      }

      throw new BadRequestException(
        response.data.responseMessage || 'Failed to initialize payment',
      );
    } catch (error) {
      this.logger.error('Monnify initialize payment error:', error.message);
      throw new BadRequestException(
        error.response?.data?.responseMessage || 'Failed to initialize payment',
      );
    }
  }

  async verifyPayment(reference: string): Promise<VerifyPaymentResponse> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await this.client.get(
        `/api/v2/transactions/${encodeURIComponent(reference)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.data.requestSuccessful) {
        const data = response.data.responseBody;
        return {
          success: data.paymentStatus === 'PAID',
          reference: data.paymentReference,
          amount: data.amountPaid,
          currency: data.currencyCode,
          status: this.mapMonnifyStatus(data.paymentStatus),
          paidAt: data.paidOn ? new Date(data.paidOn) : undefined,
          metadata: data.metaData,
        };
      }

      throw new BadRequestException('Payment verification failed');
    } catch (error) {
      this.logger.error('Monnify verify payment error:', error.message);
      throw new BadRequestException(
        error.response?.data?.responseMessage || 'Failed to verify payment',
      );
    }
  }

  async refundPayment(
    request: RefundPaymentRequest,
  ): Promise<RefundPaymentResponse> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await this.client.post(
        '/api/v1/merchant/refunds/initiate',
        {
          transactionReference: request.reference,
          refundAmount: request.amount,
          refundReason: request.reason || 'Customer request',
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.data.requestSuccessful) {
        const data = response.data.responseBody;
        return {
          success: true,
          reference: request.reference,
          refundReference: data.refundReference,
          amount: data.refundAmount,
          status: data.refundStatus,
        };
      }

      throw new BadRequestException('Refund failed');
    } catch (error) {
      this.logger.error('Monnify refund error:', error.message);
      throw new BadRequestException(
        error.response?.data?.responseMessage || 'Failed to process refund',
      );
    }
  }

  async handleWebhook(payload: PaymentWebhookPayload): Promise<void> {
    this.logger.log(`Monnify webhook event: ${payload.event}`);

    switch (payload.event) {
      case 'SUCCESSFUL_TRANSACTION':
        this.logger.log(`Payment successful: ${payload.data.paymentReference}`);
        // Handle successful payment
        break;
      case 'FAILED_TRANSACTION':
        this.logger.log(`Payment failed: ${payload.data.paymentReference}`);
        // Handle failed payment
        break;
      case 'REFUND_COMPLETED':
        this.logger.log(`Refund completed: ${payload.data.refundReference}`);
        // Handle refund
        break;
      default:
        this.logger.log(`Unhandled webhook event: ${payload.event}`);
    }
  }

  private mapMonnifyStatus(status: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      PAID: PaymentStatus.COMPLETED,
      FAILED: PaymentStatus.FAILED,
      PENDING: PaymentStatus.PENDING,
      EXPIRED: PaymentStatus.FAILED,
      CANCELLED: PaymentStatus.FAILED,
    };

    return statusMap[status] || PaymentStatus.PENDING;
  }

  private generateReference(): string {
    return `MNF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
