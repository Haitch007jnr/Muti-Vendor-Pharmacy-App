import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  IsUUID,
  IsEnum,
  Min,
  Max,
  MaxLength,
} from "class-validator";
import { LoanType } from "../entities/loan.entity";

export class CreateLoanDto {
  @ApiProperty({
    description: "Vendor ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  vendorId: string;

  @ApiProperty({
    description: "Loan authority ID",
    example: "123e4567-e89b-12d3-a456-426614174001",
  })
  @IsUUID()
  authorityId: string;

  @ApiProperty({
    description: "Loan reference number",
    example: "LOAN-2025-0001",
  })
  @IsString()
  @MaxLength(100)
  referenceNumber: string;

  @ApiProperty({
    description: "Loan type",
    enum: LoanType,
    example: LoanType.TERM_LOAN,
  })
  @IsEnum(LoanType)
  loanType: LoanType;

  @ApiProperty({
    description: "Loan principal amount",
    example: 1000000,
  })
  @IsNumber()
  @Min(0)
  principalAmount: number;

  @ApiProperty({
    description: "Interest rate (percentage)",
    example: 15.5,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  interestRate: number;

  @ApiProperty({
    description: "Loan tenure in months",
    example: 12,
  })
  @IsNumber()
  @Min(1)
  tenureMonths: number;

  @ApiProperty({
    description: "Loan start date",
    example: "2025-01-01",
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: "Account ID for loan transactions",
    required: false,
    example: "123e4567-e89b-12d3-a456-426614174002",
  })
  @IsOptional()
  @IsUUID()
  accountId?: string;

  @ApiProperty({
    description: "Loan purpose",
    required: false,
    example: "Business expansion",
  })
  @IsOptional()
  @IsString()
  purpose?: string;

  @ApiProperty({
    description: "Additional notes",
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
