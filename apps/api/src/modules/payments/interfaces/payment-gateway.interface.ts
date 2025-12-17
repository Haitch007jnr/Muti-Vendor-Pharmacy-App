export enum PaymentGateway {
  PAYSTACK = "paystack",
  MONNIFY = "monnify",
}

export enum PaymentStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export interface InitializePaymentRequest {
  amount: number;
  currency: string;
  email: string;
  reference?: string;
  metadata?: Record<string, any>;
  callbackUrl?: string;
}

export interface InitializePaymentResponse {
  success: boolean;
  reference: string;
  authorizationUrl: string;
  accessCode?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  reference: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paidAt?: Date;
  metadata?: Record<string, any>;
}

export interface RefundPaymentRequest {
  reference: string;
  amount?: number;
  reason?: string;
}

export interface RefundPaymentResponse {
  success: boolean;
  reference: string;
  refundReference: string;
  amount: number;
  status: string;
}

export interface PaymentWebhookPayload {
  event: string;
  data: any;
}

export interface PaymentWebhookResponse {
  event: string;
  reference: string;
  status: PaymentStatus;
  message: string;
}

export interface IPaymentGateway {
  initializePayment(
    request: InitializePaymentRequest,
  ): Promise<InitializePaymentResponse>;

  verifyPayment(reference: string): Promise<VerifyPaymentResponse>;

  refundPayment(request: RefundPaymentRequest): Promise<RefundPaymentResponse>;

  handleWebhook(payload: PaymentWebhookPayload): Promise<PaymentWebhookResponse>;
}
