import { ApiProperty } from "@nestjs/swagger";
import {
  IsUUID,
  IsEnum,
  IsDate,
  IsNumber,
  IsString,
  IsArray,
  IsOptional,
  ValidateNested,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { PayrollPeriodType } from "../entities/payroll.entity";

export class PayslipItemDto {
  @ApiProperty({ description: "Employee ID" })
  @IsUUID()
  employeeId: string;

  @ApiProperty({ description: "Basic salary" })
  @IsNumber()
  @Min(0)
  basicSalary: number;

  @ApiProperty({ description: "Allowances", required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  allowances?: number;

  @ApiProperty({ description: "Bonuses", required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  bonuses?: number;

  @ApiProperty({ description: "Overtime pay", required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  overtime?: number;

  @ApiProperty({ description: "Tax deduction", required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  tax?: number;

  @ApiProperty({ description: "Pension deduction", required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  pension?: number;

  @ApiProperty({ description: "Health insurance deduction", required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  healthInsurance?: number;

  @ApiProperty({ description: "Other deductions", required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  otherDeductions?: number;

  @ApiProperty({ description: "Notes", required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreatePayrollDto {
  @ApiProperty({ description: "Vendor ID" })
  @IsUUID()
  vendorId: string;

  @ApiProperty({ description: "Payroll period type", enum: PayrollPeriodType })
  @IsEnum(PayrollPeriodType)
  periodType: PayrollPeriodType;

  @ApiProperty({ description: "Period start date" })
  @IsDate()
  @Type(() => Date)
  periodStart: Date;

  @ApiProperty({ description: "Period end date" })
  @IsDate()
  @Type(() => Date)
  periodEnd: Date;

  @ApiProperty({ description: "Payment date" })
  @IsDate()
  @Type(() => Date)
  paymentDate: Date;

  @ApiProperty({ description: "Payslip items", type: [PayslipItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PayslipItemDto)
  payslips: PayslipItemDto[];

  @ApiProperty({ description: "Notes", required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
