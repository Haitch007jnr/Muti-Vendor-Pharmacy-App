import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class GeneratePayslipDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsUUID()
  employeeId: string;

  @ApiProperty({ description: 'Basic salary' })
  @IsNumber()
  @Min(0)
  basicSalary: number;

  @ApiProperty({ description: 'Allowances', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  allowances?: number;

  @ApiProperty({ description: 'Bonuses', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  bonuses?: number;

  @ApiProperty({ description: 'Overtime pay', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  overtime?: number;

  @ApiProperty({ description: 'Tax rate percentage', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  taxRate?: number;

  @ApiProperty({ description: 'Pension rate percentage', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  pensionRate?: number;

  @ApiProperty({ description: 'Health insurance amount', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  healthInsurance?: number;

  @ApiProperty({ description: 'Other deductions', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  otherDeductions?: number;

  @ApiProperty({ description: 'Payment method', required: false })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @ApiProperty({ description: 'Bank account ID', required: false })
  @IsUUID()
  @IsOptional()
  bankAccountId?: string;

  @ApiProperty({ description: 'Notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
