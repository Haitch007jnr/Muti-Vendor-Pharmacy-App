import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsUUID,
  IsBoolean,
  MaxLength,
} from "class-validator";

export class CreateDepartmentDto {
  @ApiProperty({
    description: "Vendor ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  vendorId: string;

  @ApiProperty({ description: "Department name", example: "Pharmacy" })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: "Department description", required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: "Department manager ID", required: false })
  @IsOptional()
  @IsUUID()
  managerId?: string;

  @ApiProperty({ description: "Is active", required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
