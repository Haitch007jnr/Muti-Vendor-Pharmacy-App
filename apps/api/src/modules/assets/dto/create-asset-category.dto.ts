import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  MaxLength,
  Min,
  Max,
  IsBoolean,
} from "class-validator";

export class CreateAssetCategoryDto {
  @ApiProperty({
    description: "Vendor ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  vendorId: string;

  @ApiProperty({
    description: "Category name",
    example: "Office Equipment",
  })
  @IsString()
  @MaxLength(255)
  categoryName: string;

  @ApiProperty({
    description: "Category description",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Default depreciation rate (percentage per year)",
    required: false,
    default: 10.0,
    example: 20.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  defaultDepreciationRate?: number;

  @ApiProperty({
    description: "Default useful life in years",
    required: false,
    default: 5,
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  defaultUsefulLife?: number;

  @ApiProperty({
    description: "Is category active",
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
