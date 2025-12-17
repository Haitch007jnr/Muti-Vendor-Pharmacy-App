import { PartialType } from "@nestjs/swagger";
import { CreateEmployeeDto } from "./create-employee.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsDateString } from "class-validator";

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
  @ApiProperty({
    description: "Termination date",
    required: false,
    example: "2025-12-31",
  })
  @IsOptional()
  @IsDateString()
  terminationDate?: string;
}
