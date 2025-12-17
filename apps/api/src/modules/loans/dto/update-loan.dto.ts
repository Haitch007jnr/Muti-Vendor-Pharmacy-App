import { PartialType } from "@nestjs/swagger";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { CreateLoanDto } from "./create-loan.dto";
import { LoanStatus } from "../entities/loan.entity";

export class UpdateLoanDto extends PartialType(CreateLoanDto) {
  @ApiProperty({
    description: "Loan status",
    enum: LoanStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(LoanStatus)
  status?: LoanStatus;
}
