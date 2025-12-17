import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { PaymentsService } from "./services/payments.service";
import { InitializePaymentDto } from "./dto/initialize-payment.dto";
import { VerifyPaymentDto } from "./dto/verify-payment.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";
import { PermissionsGuard } from "../auth/guards/permissions.guard";

@ApiTags("Payments")
@Controller("payments")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post("initialize")
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
  async initializePayment(@Body() dto: InitializePaymentDto) {
    return this.paymentsService.initializePayment(dto.gateway, {
      amount: dto.amount,
      currency: dto.currency,
      email: dto.email,
      reference: dto.reference,
      metadata: dto.metadata,
      callbackUrl: dto.callbackUrl,
    });
  }

  @Get("verify")
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
}
