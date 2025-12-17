import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNumber, IsEnum, IsOptional, Min } from "class-validator";
import { TransactionType } from "../entities/client-transaction.entity";

export class CreateTransactionDto {
  @ApiProperty({
    description: "Transaction type",
    enum: TransactionType,
    example: TransactionType.DEBIT,
  })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({ description: "Transaction amount", example: 50000.0 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: "Transaction description",
    example: "Payment for invoice #INV-001",
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: "Transaction reference",
    required: false,
    example: "INV-001",
  })
  @IsOptional()
  @IsString()
  reference?: string;
}
