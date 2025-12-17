import { ApiProperty } from "@nestjs/swagger";
import { IsUUID, IsNumber, IsString, IsOptional, Min } from "class-validator";

export class BalanceTransferDto {
  @ApiProperty({ description: "Source account ID" })
  @IsUUID()
  fromAccountId: string;

  @ApiProperty({ description: "Destination account ID" })
  @IsUUID()
  toAccountId: string;

  @ApiProperty({ description: "Transfer amount" })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: "Transfer description", required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: "Reference number", required: false })
  @IsString()
  @IsOptional()
  reference?: string;
}
