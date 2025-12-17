import { ApiProperty } from "@nestjs/swagger";
import {
  IsUUID,
  IsEnum,
  IsNumber,
  IsString,
  IsOptional,
  Min,
} from "class-validator";
import {
  TransactionType,
  TransactionCategory,
} from "../entities/account.entity";

export class CreateTransactionDto {
  @ApiProperty({ description: "Account ID" })
  @IsUUID()
  accountId: string;

  @ApiProperty({ description: "Transaction type", enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({
    description: "Transaction category",
    enum: TransactionCategory,
    required: false,
  })
  @IsEnum(TransactionCategory)
  @IsOptional()
  category?: TransactionCategory;

  @ApiProperty({ description: "Transaction amount" })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: "Transaction description", required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: "Reference number", required: false })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiProperty({ description: "Additional metadata", required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}
