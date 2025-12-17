import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  IsUUID,
  IsEnum,
  Min,
} from "class-validator";
import { PaymentType } from "../entities/loan-payment.entity";

export class CreateLoanPaymentDto {
  @ApiProperty({
    description: "Loan ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  loanId: string;

  @ApiProperty({
    description: "Payment amount",
    example: 100000,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: "Payment type",
    enum: PaymentType,
    example: PaymentType.MIXED,
  })
  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @ApiProperty({
    description: "Principal amount in this payment",
    required: false,
    example: 80000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  principalAmount?: number;

  @ApiProperty({
    description: "Interest amount in this payment",
    required: false,
    example: 20000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  interestAmount?: number;

  @ApiProperty({
    description: "Payment date",
    example: "2025-01-15",
  })
  @IsDateString()
  paymentDate: string;

  @ApiProperty({
    description: "Payment reference",
    required: false,
    example: "PAY-2025-0001",
  })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({
    description: "Additional notes",
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
