import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsObject,
  MaxLength,
} from 'class-validator';
import { BankDetails } from '../entities/supplier.entity';

export class CreateSupplierDto {
  @ApiProperty({ description: 'Vendor ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  vendorId: string;

  @ApiProperty({ description: 'Supplier name', example: 'ABC Medical Supplies Ltd' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Supplier email', required: false, example: 'info@abcsupplies.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Supplier phone', required: false, example: '+2348012345678' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ description: 'Supplier address', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'City', required: false, example: 'Lagos' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiProperty({ description: 'Country', required: false, example: 'Nigeria' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiProperty({ description: 'Tax ID', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxId?: string;

  @ApiProperty({
    description: 'Bank details',
    required: false,
    example: { bankName: 'First Bank', accountNumber: '1234567890', accountName: 'ABC Supplies' },
  })
  @IsOptional()
  @IsObject()
  bankDetails?: BankDetails;

  @ApiProperty({ description: 'Contact person', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  contactPerson?: string;

  @ApiProperty({ description: 'Is active', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
