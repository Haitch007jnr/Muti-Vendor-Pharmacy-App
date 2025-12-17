import { IsString, IsOptional, IsObject, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { PaymentGateway } from "../interfaces/payment-gateway.interface";

export class ReconcilePaymentDto {
  @ApiProperty({ enum: PaymentGateway, example: PaymentGateway.PAYSTACK })
  @IsEnum(PaymentGateway)
  gateway: PaymentGateway;

  @ApiProperty({ example: "PST-1234567890-ABC123" })
  @IsString()
  reference: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
