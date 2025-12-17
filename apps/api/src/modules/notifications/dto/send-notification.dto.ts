import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import {
  NotificationChannel,
  NotificationPriority,
} from "../interfaces/notification-provider.interface";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

class RecipientDto {
  @ApiPropertyOptional({ description: "Recipient email address" })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: "Recipient phone number" })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: "Firebase device token for push notifications" })
  @IsString()
  @IsOptional()
  deviceToken?: string;

  @ApiPropertyOptional({ description: "User ID for tracking" })
  @IsString()
  @IsOptional()
  userId?: string;
}

class PayloadDto {
  @ApiPropertyOptional({ description: "Notification subject (for email)" })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty({ description: "Notification body/message" })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiPropertyOptional({ description: "Additional data for the notification" })
  @IsObject()
  @IsOptional()
  data?: Record<string, any>;

  @ApiPropertyOptional({ description: "Image URL for rich notifications" })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}

export class SendNotificationDto {
  @ApiProperty({ description: "Recipient information", type: RecipientDto })
  @ValidateNested()
  @Type(() => RecipientDto)
  recipient: RecipientDto;

  @ApiProperty({ description: "Notification payload", type: PayloadDto })
  @ValidateNested()
  @Type(() => PayloadDto)
  payload: PayloadDto;

  @ApiProperty({
    description: "Notification channel",
    enum: NotificationChannel,
  })
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @ApiPropertyOptional({
    description: "Notification priority",
    enum: NotificationPriority,
    default: NotificationPriority.MEDIUM,
  })
  @IsEnum(NotificationPriority)
  @IsOptional()
  priority?: NotificationPriority;

  @ApiPropertyOptional({ description: "Template ID to use" })
  @IsString()
  @IsOptional()
  templateId?: string;

  @ApiPropertyOptional({ description: "Variables for template substitution" })
  @IsObject()
  @IsOptional()
  variables?: Record<string, any>;
}
