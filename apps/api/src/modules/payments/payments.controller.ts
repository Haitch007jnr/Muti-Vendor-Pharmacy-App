import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Headers,
  RawBodyRequest,
  Req,
  Param,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiExcludeEndpoint,
} from "@nestjs/swagger";
import { Request } from "express";
import { PaymentsService } from "./services/payments.service";
import { WebhookService } from "./services/webhook.service";
import { InitializePaymentDto } from "./dto/initialize-payment.dto";
import { VerifyPaymentDto } from "./dto/verify-payment.dto";
import { RefundPaymentDto } from "./dto/refund-payment.dto";
import { ReconcilePaymentDto } from "./dto/reconcile-payment.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { PaymentGateway } from "./interfaces/payment-gateway.interface";

@ApiTags("Payments")
@Controller("payments")
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly webhookService: WebhookService,
  ) {}

  @Post("initialize")
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @RequirePermissions("payments.process")
  @ApiOperation({ summary: "Initialize a payment" })
  @ApiResponse({
    status: 200,
    description: "Payment initialized successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Bad request",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
  })
  async initializePayment(
    @Body() dto: InitializePaymentDto,
    @CurrentUser() user: any,
  ) {
    return this.paymentsService.initializePayment(
      dto.gateway,
      {
        amount: dto.amount,
        currency: dto.currency,
        email: dto.email,
        reference: dto.reference,
        metadata: dto.metadata,
        callbackUrl: dto.callbackUrl,
      },
      user?.id,
      user?.vendorId,
      dto.metadata?.orderId,
    );
  }

  @Get("verify")
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @RequirePermissions("payments.read")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Verify a payment" })
  @ApiResponse({
    status: 200,
    description: "Payment verified successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Bad request",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
  })
  async verifyPayment(@Query() dto: VerifyPaymentDto) {
    return this.paymentsService.verifyPayment(dto.gateway, dto.reference);
  }

  @Post("refund")
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @RequirePermissions("payments.refund")
  @ApiOperation({ summary: "Refund a payment" })
  @ApiResponse({
    status: 200,
    description: "Payment refunded successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Bad request",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
  })
  async refundPayment(@Body() dto: RefundPaymentDto) {
    return this.paymentsService.refundPayment(dto.gateway, {
      reference: dto.reference,
      amount: dto.amount,
      reason: dto.reason,
    });
  }

  @Post("reconcile")
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @RequirePermissions("payments.reconcile")
  @ApiOperation({ summary: "Reconcile a payment" })
  @ApiResponse({
    status: 200,
    description: "Payment reconciled successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Bad request",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
  })
  async reconcilePayment(
    @Body() dto: ReconcilePaymentDto,
    @CurrentUser() user: any,
  ) {
    return this.paymentsService.reconcilePayment(
      dto.gateway,
      dto.reference,
      user.id,
    );
  }

  @Get("transactions")
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @RequirePermissions("payments.read")
  @ApiOperation({ summary: "Get all payment transactions" })
  @ApiResponse({
    status: 200,
    description: "Payment transactions retrieved successfully",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
  })
  async getTransactions(
    @Query("gateway") gateway?: PaymentGateway,
    @Query("status") status?: string,
    @Query("vendorId") vendorId?: string,
    @Query("reconciled") reconciled?: string,
  ) {
    let reconciledFilter: boolean | undefined;
    if (reconciled === "true") {
      reconciledFilter = true;
    } else if (reconciled === "false") {
      reconciledFilter = false;
    }

    return this.paymentsService.getAllTransactions({
      gateway,
      status: status as any,
      vendorId,
      reconciled: reconciledFilter,
    });
  }

  @Get("transactions/:reference")
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @RequirePermissions("payments.read")
  @ApiOperation({ summary: "Get a payment transaction by reference" })
  @ApiResponse({
    status: 200,
    description: "Payment transaction retrieved successfully",
  })
  @ApiResponse({
    status: 404,
    description: "Transaction not found",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
  })
  async getTransactionByReference(@Param("reference") reference: string) {
    return this.paymentsService.getTransactionByReference(reference);
  }

  @Get("stats")
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @RequirePermissions("payments.read")
  @ApiOperation({ summary: "Get payment statistics" })
  @ApiResponse({
    status: 200,
    description: "Payment statistics retrieved successfully",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
  })
  async getPaymentStats(@Query("vendorId") vendorId?: string) {
    return this.paymentsService.getPaymentStats(vendorId);
  }

  // Webhook endpoints - public, no authentication required
  @Post("webhooks/paystack")
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async handlePaystackWebhook(
    @Headers("x-paystack-signature") signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const rawBody = req.rawBody?.toString("utf8") || JSON.stringify(req.body);
    const payload = req.body;

    return this.webhookService.handlePaystackWebhook(
      payload,
      signature,
      rawBody,
    );
  }

  @Post("webhooks/monnify")
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async handleMonnifyWebhook(
    @Headers("monnify-signature") signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const rawBody = req.rawBody?.toString("utf8") || JSON.stringify(req.body);
    const payload = req.body;

    return this.webhookService.handleMonnifyWebhook(
      payload,
      signature,
      rawBody,
    );
  }
}
