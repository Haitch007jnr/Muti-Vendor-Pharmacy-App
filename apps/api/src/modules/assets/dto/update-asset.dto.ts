import { PartialType } from "@nestjs/swagger";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsDateString } from "class-validator";
import { CreateAssetDto } from "./create-asset.dto";
import { AssetStatus } from "../entities/asset.entity";

export class UpdateAssetDto extends PartialType(CreateAssetDto) {
  @ApiProperty({
    description: "Asset status",
    enum: AssetStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;

  @ApiProperty({
    description: "Last maintenance date",
    required: false,
    example: "2025-06-15",
  })
  @IsOptional()
  @IsDateString()
  lastMaintenanceDate?: string;

  @ApiProperty({
    description: "Next maintenance date",
    required: false,
    example: "2025-12-15",
  })
  @IsOptional()
  @IsDateString()
  nextMaintenanceDate?: string;
}
