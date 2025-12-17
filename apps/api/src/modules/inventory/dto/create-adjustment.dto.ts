import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, IsString, IsEnum, IsOptional, Min } from 'class-validator';
import { InventoryAdjustmentType } from '../entities/inventory.entity';

export class CreateAdjustmentDto {
  @ApiProperty({ description: 'Inventory ID' })
  @IsUUID()
  inventoryId: string;

  @ApiProperty({ description: 'Adjustment type', enum: InventoryAdjustmentType })
  @IsEnum(InventoryAdjustmentType)
  adjustmentType: InventoryAdjustmentType;

  @ApiProperty({ description: 'Quantity to adjust' })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Reason for adjustment' })
  @IsString()
  reason: string;

  @ApiProperty({ description: 'Reference number', required: false })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
