import { IsEnum, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { PaymentGateway } from "../interfaces/payment-gateway.interface";

export class VerifyPaymentDto {
  @ApiProperty({ enum: PaymentGateway, example: PaymentGateway.PAYSTACK })
  @IsEnum(PaymentGateway)
  gateway: PaymentGateway;

  @ApiProperty({ example: "PST-1234567890-ABC123" })
  @IsString()
  reference: string;
}
