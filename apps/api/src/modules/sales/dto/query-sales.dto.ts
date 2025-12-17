import { ApiProperty } from "@nestjs/swagger";
import {
  IsOptional,
  IsUUID,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
  Max,
} from "class-validator";
import { Type } from "class-transformer";
import { SalesStatus, PaymentStatus } from "../entities/sales.entity";

export class QuerySalesDto {
  @ApiProperty({ description: "Vendor ID", required: false })
  @IsOptional()
  @IsUUID()
  vendorId?: string;

  @ApiProperty({ description: "Client ID", required: false })
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @ApiProperty({ description: "Customer ID", required: false })
  @IsOptional()
  @IsUUID()
  customerId?: string;

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

  @ApiProperty({
    description: "Start date",
    required: false,
    example: "2025-01-01",
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: "End date",
    required: false,
    example: "2025-12-31",
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: "Page number",
    required: false,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({
    description: "Items per page",
    required: false,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
