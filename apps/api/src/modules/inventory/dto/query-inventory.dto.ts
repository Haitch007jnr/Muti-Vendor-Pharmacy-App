import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsInt, IsBoolean, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryInventoryDto {
  @ApiProperty({ description: 'Vendor ID filter', required: false })
  @IsUUID()
  @IsOptional()
  vendorId?: string;

  @ApiProperty({ description: 'Product ID filter', required: false })
  @IsUUID()
  @IsOptional()
  productId?: string;

  @ApiProperty({ description: 'Filter for low stock items', required: false })
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  lowStock?: boolean;

  @ApiProperty({ description: 'Filter for expired items', required: false })
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  expired?: boolean;

  @ApiProperty({ description: 'Filter for items expiring soon (within days)', required: false })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  expiringSoonDays?: number;

  @ApiProperty({ description: 'Page number', required: false, default: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', required: false, default: 20 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 20;
}
