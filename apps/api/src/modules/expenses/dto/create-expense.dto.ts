import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  IsUUID,
  IsEnum,
  Min,
  MaxLength,
} from "class-validator";
import { PaymentMethod } from "../entities/expense.entity";

export class CreateExpenseDto {
  @ApiProperty({
    description: "Vendor ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  vendorId: string;

  @ApiProperty({ description: "Expense category", example: "Office Supplies" })
  @IsString()
  @MaxLength(100)
  category: string;

  @ApiProperty({
    description: "Expense subcategory",
    required: false,
    example: "Stationery",
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  subcategory?: string;

  @ApiProperty({
    description: "Expense description",
    required: false,
    example: "Purchase of office supplies",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: "Expense amount", example: 15000.5 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ description: "Expense date", example: "2025-12-16" })
  @IsDateString()
  date: string;

  @ApiProperty({
    description: "Payment method",
    required: false,
    enum: PaymentMethod,
    example: PaymentMethod.CASH,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiProperty({ description: "Receipt URL", required: false })
  @IsOptional()
  @IsString()
  receiptUrl?: string;

  @ApiProperty({ description: "Additional notes", required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
