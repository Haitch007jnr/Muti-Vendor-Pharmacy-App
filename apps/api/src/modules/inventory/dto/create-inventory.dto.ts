import { ApiProperty } from "@nestjs/swagger";
import {
  IsUUID,
  IsInt,
  IsOptional,
  IsString,
  IsDate,
  Min,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateInventoryDto {
  @ApiProperty({ description: "Product ID" })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: "Vendor ID" })
  @IsUUID()
  vendorId: string;

  @ApiProperty({ description: "Quantity available", default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  quantityAvailable?: number;

  @ApiProperty({
    description: "Quantity reserved",
    default: 0,
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  quantityReserved?: number;

  @ApiProperty({ description: "Reorder level", default: 10, required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  reorderLevel?: number;

  @ApiProperty({
    description: "Reorder quantity",
    default: 50,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  reorderQuantity?: number;

  @ApiProperty({ description: "Batch number", required: false })
  @IsString()
  @IsOptional()
  batchNumber?: string;

  @ApiProperty({ description: "Expiry date", required: false })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  expiryDate?: Date;
}
