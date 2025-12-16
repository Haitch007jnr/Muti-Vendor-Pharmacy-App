import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SalesStatus, PaymentMethod, PaymentStatus } from '../entities/sales.entity';

export class CreateSalesItemDto {
  @ApiProperty({ description: 'Product ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Quantity', example: 10 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Unit price', example: 150.00 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ description: 'Discount percentage', required: false, example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercentage?: number;

  @ApiProperty({ description: 'Tax percentage', required: false, example: 7.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxPercentage?: number;

  @ApiProperty({ description: 'Batch number', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  batchNumber?: string;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateSalesDto {
  @ApiProperty({ description: 'Vendor ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  vendorId: string;

  @ApiProperty({ description: 'Client ID', required: false, example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @ApiProperty({ description: 'Customer ID', required: false, example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiProperty({ description: 'Sales date', example: '2025-12-16' })
  @IsDateString()
  salesDate: string;

  @ApiProperty({ description: 'Due date', required: false, example: '2025-12-25' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ description: 'Payment method', required: false, enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiProperty({ description: 'Payment terms', required: false })
  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Customer notes', required: false })
  @IsOptional()
  @IsString()
  customerNotes?: string;

  @ApiProperty({ description: 'Sales items', type: [CreateSalesItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSalesItemDto)
  items: CreateSalesItemDto[];
}
