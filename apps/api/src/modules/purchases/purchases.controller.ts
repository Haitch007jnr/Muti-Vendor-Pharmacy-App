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
import { PurchasesService } from "./purchases.service";
import { CreatePurchaseDto } from "./dto/create-purchase.dto";
import { UpdatePurchaseDto } from "./dto/update-purchase.dto";
import { QueryPurchaseDto } from "./dto/query-purchase.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";

@ApiTags("Purchases")
@Controller("purchases")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post()
  @RequirePermissions("purchases.create")
  @ApiOperation({ summary: "Create a new purchase order" })
  @ApiResponse({
    status: 201,
    description: "Purchase order created successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async create(
    @Body() createPurchaseDto: CreatePurchaseDto,
    @Request() req: any,
  ) {
    return this.purchasesService.create(createPurchaseDto, req.user.id);
  }

  @Get()
  @RequirePermissions("purchases.read")
  @ApiOperation({ summary: "Get all purchases with filters" })
  @ApiResponse({ status: 200, description: "Purchases retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async findAll(@Query() query: QueryPurchaseDto) {
    return this.purchasesService.findAll(query);
  }

  @Get("summary/total")
  @RequirePermissions("purchases.read")
  @ApiOperation({ summary: "Get total purchases amount" })
  @ApiResponse({ status: 200, description: "Total retrieved successfully" })
  async getTotalPurchases(
    @Query("vendorId") vendorId: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    const total = await this.purchasesService.getTotalPurchases(
      vendorId,
      startDate,
      endDate,
    );
    return { total };
  }

  @Get("products/:productId/average-price")
  @RequirePermissions("purchases.read")
  @ApiOperation({ summary: "Get average purchase price for a product" })
  @ApiParam({ name: "productId", description: "Product ID" })
  @ApiResponse({
    status: 200,
    description: "Average price retrieved successfully",
  })
  async getAveragePurchasePrice(
    @Param("productId") productId: string,
    @Query("vendorId") vendorId: string,
  ) {
    const avgPrice = await this.purchasesService.getAveragePurchasePrice(
      productId,
      vendorId,
    );
    return { productId, avgPrice };
  }

  @Get(":id")
  @RequirePermissions("purchases.read")
  @ApiOperation({ summary: "Get purchase by ID" })
  @ApiParam({ name: "id", description: "Purchase ID" })
  @ApiResponse({ status: 200, description: "Purchase retrieved successfully" })
  @ApiResponse({ status: 404, description: "Purchase not found" })
  async findOne(@Param("id") id: string) {
    return this.purchasesService.findOne(id);
  }

  @Patch(":id")
  @RequirePermissions("purchases.update")
  @ApiOperation({ summary: "Update purchase" })
  @ApiParam({ name: "id", description: "Purchase ID" })
  @ApiResponse({ status: 200, description: "Purchase updated successfully" })
  @ApiResponse({ status: 404, description: "Purchase not found" })
  async update(
    @Param("id") id: string,
    @Body() updatePurchaseDto: UpdatePurchaseDto,
    @Request() req: any,
  ) {
    return this.purchasesService.update(id, updatePurchaseDto, req.user.id);
  }

  @Post(":id/approve")
  @RequirePermissions("purchases.approve")
  @ApiOperation({ summary: "Approve a purchase order" })
  @ApiParam({ name: "id", description: "Purchase ID" })
  @ApiResponse({ status: 200, description: "Purchase approved successfully" })
  @ApiResponse({ status: 400, description: "Invalid status transition" })
  async approve(@Param("id") id: string, @Request() req: any) {
    return this.purchasesService.approvePurchase(id, req.user.id);
  }

  @Post(":id/receive")
  @RequirePermissions("purchases.receive")
  @ApiOperation({ summary: "Mark purchase as received" })
  @ApiParam({ name: "id", description: "Purchase ID" })
  @ApiResponse({ status: 200, description: "Purchase received successfully" })
  @ApiResponse({ status: 400, description: "Invalid status transition" })
  async receive(
    @Param("id") id: string,
    @Body() body: { items?: Array<{ itemId: string; quantity: number }> },
    @Request() req: any,
  ) {
    return this.purchasesService.receivePurchase(id, req.user.id, body.items);
  }

  @Post(":id/cancel")
  @RequirePermissions("purchases.cancel")
  @ApiOperation({ summary: "Cancel a purchase order" })
  @ApiParam({ name: "id", description: "Purchase ID" })
  @ApiResponse({ status: 200, description: "Purchase cancelled successfully" })
  @ApiResponse({ status: 400, description: "Cannot cancel received purchase" })
  async cancel(@Param("id") id: string) {
    return this.purchasesService.cancelPurchase(id);
  }

  @Delete(":id")
  @RequirePermissions("purchases.delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete purchase" })
  @ApiParam({ name: "id", description: "Purchase ID" })
  @ApiResponse({ status: 204, description: "Purchase deleted successfully" })
  @ApiResponse({ status: 404, description: "Purchase not found" })
  async remove(@Param("id") id: string) {
    await this.purchasesService.remove(id);
  }
}
