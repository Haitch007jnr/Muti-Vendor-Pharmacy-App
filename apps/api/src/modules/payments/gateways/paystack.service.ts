import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance } from "axios";
import {
  IPaymentGateway,
  InitializePaymentRequest,
  InitializePaymentResponse,
  VerifyPaymentResponse,
  RefundPaymentRequest,
  RefundPaymentResponse,
  PaymentWebhookPayload,
  PaymentStatus,
} from "../interfaces/payment-gateway.interface";

@Injectable()
export class PaystackService implements IPaymentGateway {
  private readonly logger = new Logger(PaystackService.name);
  private readonly client: AxiosInstance;
  private readonly secretKey: string;

  constructor(private configService: ConfigService) {
    this.secretKey =
      this.configService.get<string>("PAYSTACK_SECRET_KEY") || "";

    if (!this.secretKey) {
      throw new Error("PAYSTACK_SECRET_KEY is not configured");
    }

    this.client = axios.create({
      baseURL: "https://api.paystack.co",
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        "Content-Type": "application/json",
      },
    });
  }

  async initializePayment(
    request: InitializePaymentRequest,
  ): Promise<InitializePaymentResponse> {
    try {
      const response = await this.client.post("/transaction/initialize", {
        email: request.email,
        amount: Math.round(request.amount * 100), // Convert to kobo
        currency: request.currency || "NGN",
        reference: request.reference,
        callback_url: request.callbackUrl,
        metadata: request.metadata,
      });

      if (response.data.status) {
        return {
          success: true,
          reference: response.data.data.reference,
          authorizationUrl: response.data.data.authorization_url,
          accessCode: response.data.data.access_code,
        };
      }

      throw new BadRequestException(
        response.data.message || "Failed to initialize payment",
      );
    } catch (error) {
      this.logger.error("Paystack initialize payment error:", error.message);
      throw new BadRequestException(
        error.response?.data?.message || "Failed to initialize payment",
      );
    }
  }

  async verifyPayment(reference: string): Promise<VerifyPaymentResponse> {
    try {
      const response = await this.client.get(
        `/transaction/verify/${reference}`,
      );

      if (response.data.status && response.data.data) {
        const data = response.data.data;
        return {
          success: data.status === "success",
          reference: data.reference,
          amount: data.amount / 100, // Convert from kobo
          currency: data.currency,
          status: this.mapPaystackStatus(data.status),
          paidAt: data.paid_at ? new Date(data.paid_at) : undefined,
          metadata: data.metadata,
        };
      }

      throw new BadRequestException("Payment verification failed");
    } catch (error) {
      this.logger.error("Paystack verify payment error:", error.message);
      throw new BadRequestException(
        error.response?.data?.message || "Failed to verify payment",
      );
    }
  }

  async refundPayment(
    request: RefundPaymentRequest,
  ): Promise<RefundPaymentResponse> {
    try {
      const response = await this.client.post("/refund", {
        transaction: request.reference,
        amount: request.amount ? Math.round(request.amount * 100) : undefined,
        merchant_note: request.reason,
      });

      if (response.data.status) {
        return {
          success: true,
          reference: request.reference,
          refundReference: response.data.data.transaction.reference,
          amount: response.data.data.transaction.amount / 100,
          status: response.data.data.transaction.status,
        };
      }

      throw new BadRequestException("Refund failed");
    } catch (error) {
      this.logger.error("Paystack refund error:", error.message);
      throw new BadRequestException(
        error.response?.data?.message || "Failed to process refund",
      );
    }
  }

  async handleWebhook(payload: PaymentWebhookPayload): Promise<{
    event: string;
    reference: string;
    status: PaymentStatus;
    message: string;
  }> {
    this.logger.log(`Paystack webhook event: ${payload.event}`);

    let status: PaymentStatus;
    let message: string;
    const reference = payload.data.reference;

    switch (payload.event) {
      case "charge.success":
        status = PaymentStatus.COMPLETED;
        message = `Payment successful: ${reference}`;
        this.logger.log(message);
        break;
      case "charge.failed":
        status = PaymentStatus.FAILED;
        message = `Payment failed: ${reference}`;
        this.logger.log(message);
        break;
      case "refund.processed":
        status = PaymentStatus.REFUNDED;
        message = `Refund processed: ${reference}`;
        this.logger.log(message);
        break;
      default:
        status = PaymentStatus.PENDING;
        message = `Unhandled webhook event: ${payload.event}`;
        this.logger.log(message);
    }

    return {
      event: payload.event,
      reference,
      status,
      message,
    };
  }

  private mapPaystackStatus(status: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      success: PaymentStatus.COMPLETED,
      failed: PaymentStatus.FAILED,
      pending: PaymentStatus.PENDING,
      abandoned: PaymentStatus.FAILED,
    };

    return statusMap[status] || PaymentStatus.PENDING;
  }
}
