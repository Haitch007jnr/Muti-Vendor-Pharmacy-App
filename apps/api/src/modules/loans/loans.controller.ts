import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";
import { LoansService } from "./loans.service";
import { CreateLoanDto } from "./dto/create-loan.dto";
import { UpdateLoanDto } from "./dto/update-loan.dto";
import { QueryLoanDto } from "./dto/query-loan.dto";
import { CreateLoanAuthorityDto } from "./dto/create-loan-authority.dto";
import { UpdateLoanAuthorityDto } from "./dto/update-loan-authority.dto";
import { CreateLoanPaymentDto } from "./dto/create-loan-payment.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";

@ApiTags("Loans")
@Controller("loans")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  // Loan Authority Endpoints
  @Post("authorities")
  @RequirePermissions("loans.create")
  @ApiOperation({ summary: "Create a new loan authority" })
  @ApiResponse({ status: 201, description: "Loan authority created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async createAuthority(@Body() createAuthorityDto: CreateLoanAuthorityDto) {
    return this.loansService.createAuthority(createAuthorityDto);
  }

  @Get("authorities")
  @RequirePermissions("loans.read")
  @ApiOperation({ summary: "Get all loan authorities" })
  @ApiResponse({ status: 200, description: "Loan authorities retrieved successfully" })
  async findAllAuthorities(@Query("vendorId") vendorId: string) {
    return this.loansService.findAllAuthorities(vendorId);
  }

  @Get("authorities/:id")
  @RequirePermissions("loans.read")
  @ApiOperation({ summary: "Get loan authority by ID" })
  @ApiParam({ name: "id", description: "Loan authority ID" })
  @ApiResponse({ status: 200, description: "Loan authority retrieved successfully" })
  @ApiResponse({ status: 404, description: "Loan authority not found" })
  async findOneAuthority(@Param("id") id: string) {
    return this.loansService.findOneAuthority(id);
  }

  @Patch("authorities/:id")
  @RequirePermissions("loans.update")
  @ApiOperation({ summary: "Update loan authority" })
  @ApiParam({ name: "id", description: "Loan authority ID" })
  @ApiResponse({ status: 200, description: "Loan authority updated successfully" })
  @ApiResponse({ status: 404, description: "Loan authority not found" })
  async updateAuthority(
    @Param("id") id: string,
    @Body() updateAuthorityDto: UpdateLoanAuthorityDto,
  ) {
    return this.loansService.updateAuthority(id, updateAuthorityDto);
  }

  @Delete("authorities/:id")
  @RequirePermissions("loans.delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete loan authority" })
  @ApiParam({ name: "id", description: "Loan authority ID" })
  @ApiResponse({ status: 204, description: "Loan authority deleted successfully" })
  @ApiResponse({ status: 404, description: "Loan authority not found" })
  async removeAuthority(@Param("id") id: string) {
    await this.loansService.removeAuthority(id);
  }

  // Loan Endpoints
  @Post()
  @RequirePermissions("loans.create")
  @ApiOperation({ summary: "Create a new loan" })
  @ApiResponse({ status: 201, description: "Loan created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async create(@Body() createLoanDto: CreateLoanDto) {
    return this.loansService.create(createLoanDto);
  }

  @Get()
  @RequirePermissions("loans.read")
  @ApiOperation({ summary: "Get all loans with filters" })
  @ApiResponse({ status: 200, description: "Loans retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async findAll(@Query() query: QueryLoanDto) {
    return this.loansService.findAll(query);
  }

  @Get("summary")
  @RequirePermissions("loans.read")
  @ApiOperation({ summary: "Get loan summary statistics" })
  @ApiResponse({ status: 200, description: "Summary retrieved successfully" })
  async getLoanSummary(@Query("vendorId") vendorId: string) {
    return this.loansService.getLoanSummary(vendorId);
  }

  @Get(":id")
  @RequirePermissions("loans.read")
  @ApiOperation({ summary: "Get loan by ID" })
  @ApiParam({ name: "id", description: "Loan ID" })
  @ApiResponse({ status: 200, description: "Loan retrieved successfully" })
  @ApiResponse({ status: 404, description: "Loan not found" })
  async findOne(@Param("id") id: string) {
    return this.loansService.findOne(id);
  }

  @Patch(":id")
  @RequirePermissions("loans.update")
  @ApiOperation({ summary: "Update loan" })
  @ApiParam({ name: "id", description: "Loan ID" })
  @ApiResponse({ status: 200, description: "Loan updated successfully" })
  @ApiResponse({ status: 404, description: "Loan not found" })
  async update(@Param("id") id: string, @Body() updateLoanDto: UpdateLoanDto) {
    return this.loansService.update(id, updateLoanDto);
  }

  @Delete(":id")
  @RequirePermissions("loans.delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete loan" })
  @ApiParam({ name: "id", description: "Loan ID" })
  @ApiResponse({ status: 204, description: "Loan deleted successfully" })
  @ApiResponse({ status: 404, description: "Loan not found" })
  async remove(@Param("id") id: string) {
    await this.loansService.remove(id);
  }

  // Loan Payment Endpoints
  @Post("payments")
  @RequirePermissions("loans.create")
  @ApiOperation({ summary: "Record a loan payment" })
  @ApiResponse({ status: 201, description: "Payment recorded successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  async createPayment(@Body() createPaymentDto: CreateLoanPaymentDto) {
    return this.loansService.createPayment(createPaymentDto);
  }

  @Get(":loanId/payments")
  @RequirePermissions("loans.read")
  @ApiOperation({ summary: "Get all payments for a loan" })
  @ApiParam({ name: "loanId", description: "Loan ID" })
  @ApiResponse({ status: 200, description: "Payments retrieved successfully" })
  async findAllPayments(@Param("loanId") loanId: string) {
    return this.loansService.findAllPayments(loanId);
  }
}
