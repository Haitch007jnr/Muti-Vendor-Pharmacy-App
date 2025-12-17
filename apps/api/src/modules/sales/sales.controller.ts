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
} from "@nestjs/swagger";
import { SalesService } from "./sales.service";
import { CreateSalesDto } from "./dto/create-sales.dto";
import { UpdateSalesDto } from "./dto/update-sales.dto";
import { QuerySalesDto } from "./dto/query-sales.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";

@ApiTags("Sales")
@Controller("sales")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @RequirePermissions("sales.create")
  @ApiOperation({ summary: "Create a new sales order or quotation" })
  @ApiResponse({ status: 201, description: "Sales order created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async create(@Body() createSalesDto: CreateSalesDto, @Request() req: any) {
    return this.salesService.create(createSalesDto, req.user.id);
  }

  @Get()
  @RequirePermissions("sales.read")
  @ApiOperation({ summary: "Get all sales with filters" })
  @ApiResponse({ status: 200, description: "Sales retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async findAll(@Query() query: QuerySalesDto) {
    return this.salesService.findAll(query);
  }

  @Get("summary/total")
  @RequirePermissions("sales.read")
  @ApiOperation({ summary: "Get total sales amount" })
  @ApiResponse({ status: 200, description: "Total retrieved successfully" })
  async getTotalSales(
    @Query("vendorId") vendorId: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    const total = await this.salesService.getTotalSales(
      vendorId,
      startDate,
      endDate,
    );
    return { total };
  }

  @Get("summary/by-status")
  @RequirePermissions("sales.read")
  @ApiOperation({ summary: "Get sales summary by status" })
  @ApiResponse({ status: 200, description: "Summary retrieved successfully" })
  async getSalesByStatus(
    @Query("vendorId") vendorId: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    return this.salesService.getSalesByStatus(vendorId, startDate, endDate);
  }

  @Get(":id")
  @RequirePermissions("sales.read")
  @ApiOperation({ summary: "Get sales by ID" })
  @ApiParam({ name: "id", description: "Sales ID" })
  @ApiResponse({ status: 200, description: "Sales retrieved successfully" })
  @ApiResponse({ status: 404, description: "Sales not found" })
  async findOne(@Param("id") id: string) {
    return this.salesService.findOne(id);
  }

  @Patch(":id")
  @RequirePermissions("sales.update")
  @ApiOperation({ summary: "Update sales" })
  @ApiParam({ name: "id", description: "Sales ID" })
  @ApiResponse({ status: 200, description: "Sales updated successfully" })
  @ApiResponse({ status: 404, description: "Sales not found" })
  async update(
    @Param("id") id: string,
    @Body() updateSalesDto: UpdateSalesDto,
    @Request() req: any,
  ) {
    return this.salesService.update(id, updateSalesDto, req.user.id);
  }

  @Post(":id/confirm")
  @RequirePermissions("sales.confirm")
  @ApiOperation({ summary: "Confirm a sales quotation" })
  @ApiParam({ name: "id", description: "Sales ID" })
  @ApiResponse({ status: 200, description: "Sales confirmed successfully" })
  @ApiResponse({ status: 400, description: "Invalid status transition" })
  async confirm(@Param("id") id: string, @Request() req: any) {
    return this.salesService.confirmSales(id, req.user.id);
  }

  @Post(":id/generate-invoice")
  @RequirePermissions("sales.invoice")
  @ApiOperation({ summary: "Generate invoice for sales" })
  @ApiParam({ name: "id", description: "Sales ID" })
  @ApiResponse({ status: 200, description: "Invoice generated successfully" })
  @ApiResponse({ status: 400, description: "Invalid status transition" })
  async generateInvoice(@Param("id") id: string) {
    return this.salesService.generateInvoice(id);
  }

  @Post(":id/payment")
  @RequirePermissions("sales.payment")
  @ApiOperation({ summary: "Record payment for sales" })
  @ApiParam({ name: "id", description: "Sales ID" })
  @ApiResponse({ status: 200, description: "Payment recorded successfully" })
  async recordPayment(
    @Param("id") id: string,
    @Body() body: { amount: number; paymentMethod: string },
  ) {
    return this.salesService.recordPayment(id, body.amount, body.paymentMethod);
  }

  @Post(":id/cancel")
  @RequirePermissions("sales.cancel")
  @ApiOperation({ summary: "Cancel a sales order" })
  @ApiParam({ name: "id", description: "Sales ID" })
  @ApiResponse({ status: 200, description: "Sales cancelled successfully" })
  @ApiResponse({ status: 400, description: "Cannot cancel paid sales" })
  async cancel(@Param("id") id: string) {
    return this.salesService.cancelSales(id);
  }

  @Post(":id/return")
  @RequirePermissions("sales.return")
  @ApiOperation({ summary: "Process sales return" })
  @ApiParam({ name: "id", description: "Sales ID" })
  @ApiResponse({ status: 200, description: "Sales returned successfully" })
  async return(
    @Param("id") id: string,
    @Body() body: { items?: Array<{ itemId: string; quantity: number }> },
  ) {
    return this.salesService.returnSales(id, body.items);
  }

  @Delete(":id")
  @RequirePermissions("sales.delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete sales" })
  @ApiParam({ name: "id", description: "Sales ID" })
  @ApiResponse({ status: 204, description: "Sales deleted successfully" })
  @ApiResponse({ status: 404, description: "Sales not found" })
  async remove(@Param("id") id: string) {
    await this.salesService.remove(id);
  }
}
