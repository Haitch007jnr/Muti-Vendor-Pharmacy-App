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
  Request,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { PayrollService } from "./payroll.service";
import { CreatePayrollDto } from "./dto/create-payroll.dto";
import { UpdatePayrollDto } from "./dto/update-payroll.dto";
import { GeneratePayslipDto } from "./dto/generate-payslip.dto";
import { PayrollStatus } from "./entities/payroll.entity";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";

@ApiTags("Payroll")
@Controller("payroll")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post()
  @RequirePermissions("payroll.create")
  @ApiOperation({ summary: "Create a new payroll" })
  @ApiResponse({ status: 201, description: "Payroll created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async create(
    @Body() createPayrollDto: CreatePayrollDto,
    @Request() req: any,
  ) {
    return this.payrollService.create(createPayrollDto, req.user.id);
  }

  @Get()
  @RequirePermissions("payroll.read")
  @ApiOperation({ summary: "Get all payrolls with filters" })
  @ApiQuery({
    name: "vendorId",
    required: false,
    description: "Filter by vendor ID",
  })
  @ApiQuery({
    name: "status",
    required: false,
    description: "Filter by status",
    enum: PayrollStatus,
  })
  @ApiResponse({ status: 200, description: "Payrolls retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async findAll(
    @Query("vendorId") vendorId?: string,
    @Query("status") status?: PayrollStatus,
  ) {
    return this.payrollService.findAll(vendorId, status);
  }

  @Get("summary")
  @RequirePermissions("payroll.read")
  @ApiOperation({ summary: "Get payroll summary for a vendor" })
  @ApiQuery({ name: "vendorId", description: "Vendor ID" })
  @ApiQuery({
    name: "startDate",
    required: false,
    description: "Start date filter",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    description: "End date filter",
  })
  @ApiResponse({
    status: 200,
    description: "Payroll summary retrieved successfully",
  })
  async getPayrollSummary(
    @Query("vendorId") vendorId: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.payrollService.getPayrollSummary(vendorId, start, end);
  }

  @Get(":id")
  @RequirePermissions("payroll.read")
  @ApiOperation({ summary: "Get payroll by ID" })
  @ApiParam({ name: "id", description: "Payroll ID" })
  @ApiResponse({ status: 200, description: "Payroll retrieved successfully" })
  @ApiResponse({ status: 404, description: "Payroll not found" })
  async findOne(@Param("id") id: string) {
    return this.payrollService.findOne(id);
  }

  @Patch(":id")
  @RequirePermissions("payroll.update")
  @ApiOperation({ summary: "Update payroll" })
  @ApiParam({ name: "id", description: "Payroll ID" })
  @ApiResponse({ status: 200, description: "Payroll updated successfully" })
  @ApiResponse({ status: 404, description: "Payroll not found" })
  @ApiResponse({ status: 400, description: "Cannot update paid payroll" })
  async update(
    @Param("id") id: string,
    @Body() updatePayrollDto: UpdatePayrollDto,
  ) {
    return this.payrollService.update(id, updatePayrollDto);
  }

  @Post(":id/approve")
  @RequirePermissions("payroll.approve")
  @ApiOperation({ summary: "Approve payroll" })
  @ApiParam({ name: "id", description: "Payroll ID" })
  @ApiResponse({ status: 200, description: "Payroll approved successfully" })
  @ApiResponse({ status: 400, description: "Invalid status transition" })
  async approve(@Param("id") id: string, @Request() req: any) {
    return this.payrollService.approvePayroll(id, req.user.id);
  }

  @Post(":id/mark-paid")
  @RequirePermissions("payroll.pay")
  @ApiOperation({ summary: "Mark payroll as paid" })
  @ApiParam({ name: "id", description: "Payroll ID" })
  @ApiResponse({
    status: 200,
    description: "Payroll marked as paid successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid status transition" })
  async markAsPaid(@Param("id") id: string) {
    return this.payrollService.markAsPaid(id);
  }

  @Post(":id/payslips")
  @RequirePermissions("payroll.create")
  @ApiOperation({ summary: "Add a payslip to existing payroll" })
  @ApiParam({ name: "id", description: "Payroll ID" })
  @ApiResponse({ status: 201, description: "Payslip added successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  async addPayslip(
    @Param("id") id: string,
    @Body() generatePayslipDto: GeneratePayslipDto,
  ) {
    return this.payrollService.generateSinglePayslip(id, generatePayslipDto);
  }

  @Delete(":id")
  @RequirePermissions("payroll.delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete payroll" })
  @ApiParam({ name: "id", description: "Payroll ID" })
  @ApiResponse({ status: 204, description: "Payroll deleted successfully" })
  @ApiResponse({ status: 404, description: "Payroll not found" })
  @ApiResponse({ status: 400, description: "Cannot delete paid payroll" })
  async remove(@Param("id") id: string) {
    await this.payrollService.remove(id);
  }

  // Payslip endpoints
  @Get("payslips/:id")
  @RequirePermissions("payroll.read")
  @ApiOperation({ summary: "Get payslip by ID" })
  @ApiParam({ name: "id", description: "Payslip ID" })
  @ApiResponse({ status: 200, description: "Payslip retrieved successfully" })
  @ApiResponse({ status: 404, description: "Payslip not found" })
  async getPayslip(@Param("id") id: string) {
    return this.payrollService.getPayslip(id);
  }

  @Get("employees/:employeeId/payslips")
  @RequirePermissions("payroll.read")
  @ApiOperation({ summary: "Get payslips for an employee" })
  @ApiParam({ name: "employeeId", description: "Employee ID" })
  @ApiResponse({ status: 200, description: "Payslips retrieved successfully" })
  async getEmployeePayslips(@Param("employeeId") employeeId: string) {
    return this.payrollService.getEmployeePayslips(employeeId);
  }
}
