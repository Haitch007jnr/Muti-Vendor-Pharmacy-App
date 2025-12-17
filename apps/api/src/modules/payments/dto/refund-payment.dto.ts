import { IsEnum, IsNumber, IsString, IsOptional, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { PaymentGateway } from "../interfaces/payment-gateway.interface";

export class RefundPaymentDto {
  @ApiProperty({ enum: PaymentGateway, example: PaymentGateway.PAYSTACK })
  @IsEnum(PaymentGateway)
  gateway: PaymentGateway;

  @ApiProperty({ example: "PST-1234567890-ABC123" })
  @IsString()
  reference: string;

  @ApiProperty({ required: false, example: 5000 })
  @IsOptional()
  @IsNumber()
  @Min(100)
  amount?: number;

  @ApiProperty({ required: false, example: "Customer request" })
  @IsOptional()
  @IsString()
  reason?: string;
}
