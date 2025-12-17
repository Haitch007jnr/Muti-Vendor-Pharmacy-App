import { IsEnum, IsString, IsOptional, IsObject } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UpdateType } from "../entities/update.entity";

export class CheckUpdateDto {
  @ApiPropertyOptional({
    example: "1.0.0",
    description: "Current version to check against",
  })
  @IsString()
  @IsOptional()
  currentVersion?: string;
}

export class ApplyUpdateDto {
  @ApiProperty({
    example: "1.1.0",
    description: "Version to apply",
  })
  @IsString()
  version: string;

  @ApiPropertyOptional({
    example: "admin",
    description: "User applying the update",
  })
  @IsString()
  @IsOptional()
  appliedBy?: string;
}

export class CreateUpdateDto {
  @ApiProperty({
    example: "1.1.0",
    description: "Version number",
  })
  @IsString()
  version: string;

  @ApiProperty({
    enum: UpdateType,
    example: UpdateType.MINOR,
    description: "Type of update",
  })
  @IsEnum(UpdateType)
  type: UpdateType;

  @ApiProperty({
    example: "New Features and Bug Fixes",
    description: "Update title",
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example: "This update includes new features and bug fixes",
    description: "Detailed description",
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: "- Added new feature X\n- Fixed bug Y\n- Improved performance",
    description: "Changelog details",
  })
  @IsString()
  @IsOptional()
  changelog?: string;

  @ApiPropertyOptional({
    example: { migrationRequired: true, backupRecommended: true },
    description: "Additional metadata",
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
