import { PartialType } from "@nestjs/swagger";
import { CreateLoanAuthorityDto } from "./create-loan-authority.dto";

export class UpdateLoanAuthorityDto extends PartialType(
  CreateLoanAuthorityDto,
) {}
