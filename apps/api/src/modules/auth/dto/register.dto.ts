import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { UserRoleEnum } from "../../../common/entities";

export class RegisterDto {
  @ApiProperty({ example: "john.doe@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "+2348012345678", required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: "SecurePassword123!" })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: "John" })
  @IsString()
  @MinLength(2)
  firstName: string;

  @ApiProperty({ example: "Doe" })
  @IsString()
  @MinLength(2)
  lastName: string;

  @ApiProperty({
    enum: UserRoleEnum,
    example: UserRoleEnum.CUSTOMER,
    required: false,
    default: UserRoleEnum.CUSTOMER,
  })
  @IsOptional()
  @IsEnum(UserRoleEnum)
  role?: UserRoleEnum;
}
