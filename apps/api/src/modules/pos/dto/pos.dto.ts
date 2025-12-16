import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsUUID, IsEnum, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../entities/pos.entity';

export class CreatePosSessionDto {
  @ApiProperty({ description: 'Vendor ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  vendorId: string;

  @ApiProperty({ description: 'Opening balance', example: 1000.00 })
  @IsNumber()
  @Min(0)
  openingBalance: number;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class PosTransactionItemDto {
  @ApiProperty({ description: 'Product ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Quantity', example: 2 })
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
}

export class CreatePosTransactionDto {
  @ApiProperty({ description: 'Session ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  sessionId: string;

  @ApiProperty({ description: 'Customer ID', required: false })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiProperty({ description: 'Items', type: [PosTransactionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PosTransactionItemDto)
  items: PosTransactionItemDto[];

  @ApiProperty({ description: 'Amount paid', example: 300.00 })
  @IsNumber()
  @Min(0)
  amountPaid: number;

  @ApiProperty({ description: 'Payment method', enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ClosePosSessionDto {
  @ApiProperty({ description: 'Closing balance', example: 1500.00 })
  @IsNumber()
  @Min(0)
  closingBalance: number;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
