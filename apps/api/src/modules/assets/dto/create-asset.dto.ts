import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  IsUUID,
  IsEnum,
  Min,
  Max,
  MaxLength,
} from "class-validator";
import { DepreciationMethod } from "../entities/asset.entity";

export class CreateAssetDto {
  @ApiProperty({
    description: "Vendor ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  vendorId: string;

  @ApiProperty({
    description: "Asset category ID",
    example: "123e4567-e89b-12d3-a456-426614174001",
  })
  @IsUUID()
  categoryId: string;

  @ApiProperty({
    description: "Asset name",
    example: "Dell Laptop XPS 15",
  })
  @IsString()
  @MaxLength(255)
  assetName: string;

  @ApiProperty({
    description: "Asset tag/identifier",
    example: "ASSET-2025-0001",
  })
  @IsString()
  @MaxLength(100)
  assetTag: string;

  @ApiProperty({
    description: "Asset description",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Purchase date",
    example: "2025-01-01",
  })
  @IsDateString()
  purchaseDate: string;

  @ApiProperty({
    description: "Purchase cost",
    example: 500000,
  })
  @IsNumber()
  @Min(0)
  purchaseCost: number;

  @ApiProperty({
    description: "Salvage value (residual value)",
    required: false,
    example: 50000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salvageValue?: number;

  @ApiProperty({
    description: "Useful life in years",
    example: 5,
  })
  @IsNumber()
  @Min(1)
  usefulLife: number;

  @ApiProperty({
    description: "Depreciation method",
    enum: DepreciationMethod,
    required: false,
    default: DepreciationMethod.STRAIGHT_LINE,
  })
  @IsOptional()
  @IsEnum(DepreciationMethod)
  depreciationMethod?: DepreciationMethod;

  @ApiProperty({
    description: "Annual depreciation rate (percentage)",
    required: false,
    example: 20.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  depreciationRate?: number;

  @ApiProperty({
    description: "Location of the asset",
    required: false,
    example: "Main Office - IT Department",
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiProperty({
    description: "Assigned to (employee ID)",
    required: false,
    example: "123e4567-e89b-12d3-a456-426614174002",
  })
  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @ApiProperty({
    description: "Serial number",
    required: false,
    example: "SN123456789",
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  serialNumber?: string;

  @ApiProperty({
    description: "Manufacturer",
    required: false,
    example: "Dell",
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  manufacturer?: string;

  @ApiProperty({
    description: "Model",
    required: false,
    example: "XPS 15 9520",
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  model?: string;

  @ApiProperty({
    description: "Warranty expiry date",
    required: false,
    example: "2027-01-01",
  })
  @IsOptional()
  @IsDateString()
  warrantyExpiry?: string;

  @ApiProperty({
    description: "Additional notes",
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
