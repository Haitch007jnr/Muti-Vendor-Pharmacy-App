import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsUUID, IsEnum, IsString } from "class-validator";
import { LoanType, LoanStatus } from "../entities/loan.entity";

export class QueryLoanDto {
  @ApiProperty({
    description: "Vendor ID",
    required: false,
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsOptional()
  @IsUUID()
  vendorId?: string;

  @ApiProperty({
    description: "Loan authority ID",
    required: false,
    example: "123e4567-e89b-12d3-a456-426614174001",
  })
  @IsOptional()
  @IsUUID()
  authorityId?: string;

  @ApiProperty({
    description: "Loan type",
    enum: LoanType,
    required: false,
  })
  @IsOptional()
  @IsEnum(LoanType)
  loanType?: LoanType;

  @ApiProperty({
    description: "Loan status",
    enum: LoanStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(LoanStatus)
  status?: LoanStatus;

  @ApiProperty({
    description: "Start date (from)",
    required: false,
    example: "2025-01-01",
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({
    description: "End date (to)",
    required: false,
    example: "2025-12-31",
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({
    description: "Page number",
    required: false,
    default: 1,
  })
  @IsOptional()
  page?: number;

  @ApiProperty({
    description: "Number of items per page",
    required: false,
    default: 10,
  })
  @IsOptional()
  limit?: number;
}
