import {
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
} from "class-validator";
import { NotificationChannel } from "../interfaces/notification-provider.interface";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateTemplateDto {
  @ApiProperty({ description: "Template name (unique per channel)" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "Notification channel",
    enum: NotificationChannel,
  })
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @ApiPropertyOptional({ description: "Template subject (for email)" })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty({ description: "Template body with variable placeholders (e.g., {{name}})" })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiPropertyOptional({
    description: "List of variables used in the template",
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  variables?: string[];

  @ApiPropertyOptional({ description: "Template description" })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: "Whether the template is active", default: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class UpdateTemplateDto {
  @ApiPropertyOptional({ description: "Template subject (for email)" })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiPropertyOptional({ description: "Template body with variable placeholders" })
  @IsString()
  @IsOptional()
  body?: string;

  @ApiPropertyOptional({
    description: "List of variables used in the template",
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  variables?: string[];

  @ApiPropertyOptional({ description: "Template description" })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: "Whether the template is active" })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
