import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";
import { PaymentGatewayFactory } from "./payment-gateway.factory";
import { PaymentTransactionService } from "./payment-transaction.service";
import {
  PaymentGateway,
  PaymentWebhookPayload,
  PaymentWebhookResponse,
  PaymentStatus,
} from "../interfaces/payment-gateway.interface";

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly paymentGatewayFactory: PaymentGatewayFactory,
    private readonly paymentTransactionService: PaymentTransactionService,
  ) {}

  verifyPaystackSignature(payload: string, signature: string): boolean {
    const secret = this.configService.get<string>("PAYSTACK_WEBHOOK_SECRET") ||
                   this.configService.get<string>("PAYSTACK_SECRET_KEY");

    if (!secret) {
      throw new Error("PAYSTACK_WEBHOOK_SECRET or PAYSTACK_SECRET_KEY is not configured");
    }

    const hash = crypto.createHmac("sha512", secret).update(payload).digest("hex");

    return hash === signature;
  }

  verifyMonnifySignature(payload: string, signature: string): boolean {
    const secret = this.configService.get<string>("MONNIFY_WEBHOOK_SECRET") ||
                   this.configService.get<string>("MONNIFY_SECRET_KEY");

    if (!secret) {
      throw new Error("MONNIFY_WEBHOOK_SECRET or MONNIFY_SECRET_KEY is not configured");
    }

    const hash = crypto.createHmac("sha512", secret).update(payload).digest("hex");

    return hash === signature;
  }

  async handlePaystackWebhook(
    payload: PaymentWebhookPayload,
    signature: string,
    rawPayload: string,
  ): Promise<PaymentWebhookResponse> {
    this.logger.log("Processing Paystack webhook");

    // Verify signature
    if (!this.verifyPaystackSignature(rawPayload, signature)) {
      throw new UnauthorizedException("Invalid webhook signature");
    }

    const gatewayService =
      this.paymentGatewayFactory.getGateway(PaymentGateway.PAYSTACK);
    const result = await gatewayService.handleWebhook(payload);

    // Update transaction in database
    try {
      await this.paymentTransactionService.recordWebhookAttempt(
        result.reference,
      );

      if (result.status !== PaymentStatus.PENDING) {
        await this.paymentTransactionService.updateTransactionStatus(
          result.reference,
          result.status,
          payload.data,
          result.status === PaymentStatus.COMPLETED ? new Date() : undefined,
          result.status === PaymentStatus.FAILED
            ? payload.data.gateway_response
            : undefined,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error updating transaction for webhook: ${error.message}`,
      );
      // Don't throw error - webhook was valid, just log the issue
    }

    return result;
  }

  async handleMonnifyWebhook(
    payload: PaymentWebhookPayload,
    signature: string,
    rawPayload: string,
  ): Promise<PaymentWebhookResponse> {
    this.logger.log("Processing Monnify webhook");

    // Verify signature
    if (!this.verifyMonnifySignature(rawPayload, signature)) {
      throw new UnauthorizedException("Invalid webhook signature");
    }

    const gatewayService =
      this.paymentGatewayFactory.getGateway(PaymentGateway.MONNIFY);
    const result = await gatewayService.handleWebhook(payload);

    // Update transaction in database
    try {
      await this.paymentTransactionService.recordWebhookAttempt(
        result.reference,
      );

      if (result.status !== PaymentStatus.PENDING) {
        await this.paymentTransactionService.updateTransactionStatus(
          result.reference,
          result.status,
          payload.data,
          result.status === PaymentStatus.COMPLETED ? new Date() : undefined,
          result.status === PaymentStatus.FAILED
            ? payload.data.responseMessage
            : undefined,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error updating transaction for webhook: ${error.message}`,
      );
      // Don't throw error - webhook was valid, just log the issue
    }

    return result;
  }
}
