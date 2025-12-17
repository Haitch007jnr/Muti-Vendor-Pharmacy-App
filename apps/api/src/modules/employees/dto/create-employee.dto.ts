import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  IsUUID,
  IsBoolean,
  MaxLength,
  Min,
} from "class-validator";

export class CreateEmployeeDto {
  @ApiProperty({
    description: "User ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: "Vendor ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  vendorId: string;

  @ApiProperty({ description: "Department ID", required: false })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiProperty({
    description: "Employee number",
    required: false,
    example: "EMP-001",
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  employeeNumber?: string;

  @ApiProperty({
    description: "Position/Job title",
    required: false,
    example: "Pharmacist",
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string;

  @ApiProperty({ description: "Salary", required: false, example: 150000.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salary?: number;

  @ApiProperty({
    description: "Hire date",
    required: false,
    example: "2025-01-01",
  })
  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @ApiProperty({ description: "Is active", required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
