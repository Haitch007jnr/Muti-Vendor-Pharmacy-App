import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsUUID,
  MaxLength,
  IsEmail,
  IsBoolean,
} from "class-validator";

export class CreateLoanAuthorityDto {
  @ApiProperty({
    description: "Vendor ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  vendorId: string;

  @ApiProperty({
    description: "Authority name (bank, microfinance, etc.)",
    example: "First Bank Nigeria",
  })
  @IsString()
  @MaxLength(255)
  authorityName: string;

  @ApiProperty({
    description: "Contact person name",
    required: false,
    example: "John Doe",
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  contactPerson?: string;

  @ApiProperty({
    description: "Contact email",
    required: false,
    example: "john.doe@firstbank.com",
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  contactEmail?: string;

  @ApiProperty({
    description: "Contact phone",
    required: false,
    example: "+2348012345678",
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  contactPhone?: string;

  @ApiProperty({
    description: "Address",
    required: false,
    example: "123 Main Street, Lagos",
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: "Additional notes",
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: "Is authority active",
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
