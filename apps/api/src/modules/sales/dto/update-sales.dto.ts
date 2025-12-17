import { PartialType } from "@nestjs/swagger";
import { CreateSalesDto } from "./create-sales.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsNumber, Min } from "class-validator";
import { SalesStatus, PaymentStatus } from "../entities/sales.entity";

export class UpdateSalesDto extends PartialType(CreateSalesDto) {
  @ApiProperty({
    description: "Sales status",
    required: false,
    enum: SalesStatus,
  })
  @IsOptional()
  @IsEnum(SalesStatus)
  status?: SalesStatus;

  @ApiProperty({
    description: "Payment status",
    required: false,
    enum: PaymentStatus,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiProperty({ description: "Paid amount", required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmount?: number;
}
