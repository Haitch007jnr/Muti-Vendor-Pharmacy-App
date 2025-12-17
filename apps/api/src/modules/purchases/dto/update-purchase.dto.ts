import { PartialType } from "@nestjs/swagger";
import { CreatePurchaseDto } from "./create-purchase.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsDateString, IsUUID } from "class-validator";
import { PurchaseStatus, PaymentStatus } from "../entities/purchase.entity";

export class UpdatePurchaseDto extends PartialType(CreatePurchaseDto) {
  @ApiProperty({
    description: "Purchase status",
    required: false,
    enum: PurchaseStatus,
  })
  @IsOptional()
  @IsEnum(PurchaseStatus)
  status?: PurchaseStatus;

  @ApiProperty({
    description: "Payment status",
    required: false,
    enum: PaymentStatus,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiProperty({
    description: "Actual delivery date",
    required: false,
    example: "2025-12-20",
  })
  @IsOptional()
  @IsDateString()
  actualDeliveryDate?: string;

  @ApiProperty({ description: "Approved by user ID", required: false })
  @IsOptional()
  @IsUUID()
  approvedBy?: string;

  @ApiProperty({ description: "Received by user ID", required: false })
  @IsOptional()
  @IsUUID()
  receivedBy?: string;
}
