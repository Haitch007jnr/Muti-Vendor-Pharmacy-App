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
import { PurchaseStatus, PaymentMethod, PaymentStatus } from '../entities/purchase.entity';

export class CreatePurchaseItemDto {
  @ApiProperty({ description: 'Product ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Quantity', example: 100 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Unit cost', example: 50.00 })
  @IsNumber()
  @Min(0)
  unitCost: number;

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

  @ApiProperty({ description: 'Expiry date', required: false, example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreatePurchaseDto {
  @ApiProperty({ description: 'Vendor ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  vendorId: string;

  @ApiProperty({ description: 'Supplier ID', required: false, example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @ApiProperty({ description: 'Purchase date', example: '2025-12-16' })
  @IsDateString()
  purchaseDate: string;

  @ApiProperty({ description: 'Expected delivery date', required: false, example: '2025-12-25' })
  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;

  @ApiProperty({ description: 'Shipping cost', required: false, example: 500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingCost?: number;

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

  @ApiProperty({ description: 'Purchase items', type: [CreatePurchaseItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseItemDto)
  items: CreatePurchaseItemDto[];
}
