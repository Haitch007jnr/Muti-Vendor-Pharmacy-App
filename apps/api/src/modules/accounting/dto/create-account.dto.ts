import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsEnum, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';
import { AccountType } from '../entities/account.entity';

export class CreateAccountDto {
  @ApiProperty({ description: 'Vendor ID' })
  @IsUUID()
  vendorId: string;

  @ApiProperty({ description: 'Account name' })
  @IsString()
  accountName: string;

  @ApiProperty({ description: 'Account type', enum: AccountType })
  @IsEnum(AccountType)
  accountType: AccountType;

  @ApiProperty({ description: 'Initial balance', default: 0, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  balance?: number;

  @ApiProperty({ description: 'Currency code', default: 'NGN', required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ description: 'Is account active', default: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
