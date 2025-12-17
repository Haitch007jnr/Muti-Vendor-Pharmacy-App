import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsUUID, IsEnum, IsString } from "class-validator";
import { AssetStatus } from "../entities/asset.entity";

export class QueryAssetDto {
  @ApiProperty({
    description: "Vendor ID",
    required: false,
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsOptional()
  @IsUUID()
  vendorId?: string;

  @ApiProperty({
    description: "Asset category ID",
    required: false,
    example: "123e4567-e89b-12d3-a456-426614174001",
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({
    description: "Asset status",
    enum: AssetStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;

  @ApiProperty({
    description: "Location",
    required: false,
  })
  @IsOptional()
  @IsString()
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
    description: "Page number",
    required: false,
    default: 1,
  })
  @IsOptional()
  page?: number;

  @ApiProperty({
    description: "Number of items per page",
    required: false,
    default: 10,
  })
  @IsOptional()
  limit?: number;
}
