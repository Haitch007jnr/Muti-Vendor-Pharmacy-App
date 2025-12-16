import { IsEnum, IsNumber, IsString, IsEmail, IsOptional, IsObject, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentGateway } from '../interfaces/payment-gateway.interface';

export class InitializePaymentDto {
  @ApiProperty({ enum: PaymentGateway, example: PaymentGateway.PAYSTACK })
  @IsEnum(PaymentGateway)
  gateway: PaymentGateway;

  @ApiProperty({ example: 10000 })
  @IsNumber()
  @Min(100)
  amount: number;

  @ApiProperty({ example: 'NGN' })
  @IsString()
  currency: string;

  @ApiProperty({ example: 'customer@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  callbackUrl?: string;
}
