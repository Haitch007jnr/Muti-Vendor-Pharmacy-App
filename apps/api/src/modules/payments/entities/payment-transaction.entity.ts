import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { PaymentGateway, PaymentStatus } from "../interfaces/payment-gateway.interface";

@Entity("payment_transactions")
@Index(["reference"], { unique: true })
@Index(["gateway", "status"])
@Index(["createdAt"])
export class PaymentTransaction {
  @ApiProperty({ description: "Unique identifier" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ description: "Payment reference", example: "PST-1234567890-ABC123" })
  @Column({ type: "varchar", length: 100, unique: true })
  reference: string;

  @ApiProperty({ description: "Payment gateway", enum: PaymentGateway })
  @Column({ type: "enum", enum: PaymentGateway })
  gateway: PaymentGateway;

  @ApiProperty({ description: "Payment amount" })
  @Column({ type: "decimal", precision: 15, scale: 2 })
  amount: number;

  @ApiProperty({ description: "Currency code", example: "NGN" })
  @Column({ type: "varchar", length: 3, default: "NGN" })
  currency: string;

  @ApiProperty({ description: "Customer email" })
  @Column({ type: "varchar", length: 255, name: "customer_email" })
  customerEmail: string;

  @ApiProperty({ description: "Payment status", enum: PaymentStatus })
  @Column({ type: "enum", enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @ApiProperty({ description: "Authorization URL for payment" })
  @Column({ type: "text", name: "authorization_url", nullable: true })
  authorizationUrl: string;

  @ApiProperty({ description: "Access code for payment", required: false })
  @Column({ type: "varchar", length: 255, name: "access_code", nullable: true })
  accessCode: string;

  @ApiProperty({ description: "User ID who initiated the payment" })
  @Column({ type: "uuid", name: "user_id", nullable: true })
  userId: string;

  @ApiProperty({ description: "Vendor ID associated with payment" })
  @Column({ type: "uuid", name: "vendor_id", nullable: true })
  vendorId: string;

  @ApiProperty({ description: "Order ID associated with payment" })
  @Column({ type: "uuid", name: "order_id", nullable: true })
  orderId: string;

  @ApiProperty({ description: "Transaction metadata" })
  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>;

  @ApiProperty({ description: "Gateway response data" })
  @Column({ type: "jsonb", name: "gateway_response", nullable: true })
  gatewayResponse: Record<string, any>;

  @ApiProperty({ description: "Callback URL" })
  @Column({ type: "text", name: "callback_url", nullable: true })
  callbackUrl: string;

  @ApiProperty({ description: "Payment completed timestamp" })
  @Column({ type: "timestamp", name: "paid_at", nullable: true })
  paidAt: Date;

  @ApiProperty({ description: "Amount refunded" })
  @Column({ type: "decimal", precision: 15, scale: 2, name: "refunded_amount", default: 0 })
  refundedAmount: number;

  @ApiProperty({ description: "Refund reference" })
  @Column({ type: "varchar", length: 100, name: "refund_reference", nullable: true })
  refundReference?: string;

  @ApiProperty({ description: "Refund reason" })
  @Column({ type: "text", name: "refund_reason", nullable: true })
  refundReason?: string;

  @ApiProperty({ description: "Refund timestamp" })
  @Column({ type: "timestamp", name: "refunded_at", nullable: true })
  refundedAt: Date;

  @ApiProperty({ description: "Payment failure reason" })
  @Column({ type: "text", name: "failure_reason", nullable: true })
  failureReason: string;

  @ApiProperty({ description: "Number of webhook attempts received" })
  @Column({ type: "int", name: "webhook_attempts", default: 0 })
  webhookAttempts: number;

  @ApiProperty({ description: "Last webhook received timestamp" })
  @Column({ type: "timestamp", name: "last_webhook_at", nullable: true })
  lastWebhookAt: Date;

  @ApiProperty({ description: "Whether payment is reconciled" })
  @Column({ type: "boolean", default: false })
  reconciled: boolean;

  @ApiProperty({ description: "Reconciliation timestamp" })
  @Column({ type: "timestamp", name: "reconciled_at", nullable: true })
  reconciledAt: Date;

  @ApiProperty({ description: "Reconciled by user ID" })
  @Column({ type: "uuid", name: "reconciled_by", nullable: true })
  reconciledBy: string;

  @ApiProperty({ description: "Creation timestamp" })
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @ApiProperty({ description: "Last update timestamp" })
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
