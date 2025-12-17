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
import { InventoryService } from "./inventory.service";
import { CreateInventoryDto } from "./dto/create-inventory.dto";
import { UpdateInventoryDto } from "./dto/update-inventory.dto";
import { CreateAdjustmentDto } from "./dto/create-adjustment.dto";
import { QueryInventoryDto } from "./dto/query-inventory.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";

@ApiTags("Inventory")
@Controller("inventory")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @RequirePermissions("inventory.create")
  @ApiOperation({ summary: "Create inventory record" })
  @ApiResponse({
    status: 201,
    description: "Inventory record created successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(createInventoryDto);
  }

  @Get()
  @RequirePermissions("inventory.read")
  @ApiOperation({ summary: "Get all inventory with filters" })
  @ApiResponse({ status: 200, description: "Inventory retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async findAll(@Query() query: QueryInventoryDto) {
    return this.inventoryService.findAll(query);
  }

  @Get("low-stock")
  @RequirePermissions("inventory.read")
  @ApiOperation({ summary: "Get low stock items for a vendor" })
  @ApiQuery({ name: "vendorId", description: "Vendor ID" })
  @ApiResponse({
    status: 200,
    description: "Low stock items retrieved successfully",
  })
  async getLowStockItems(@Query("vendorId") vendorId: string) {
    return this.inventoryService.getLowStockItems(vendorId);
  }

  @Get("expired")
  @RequirePermissions("inventory.read")
  @ApiOperation({ summary: "Get expired items for a vendor" })
  @ApiQuery({ name: "vendorId", description: "Vendor ID" })
  @ApiResponse({
    status: 200,
    description: "Expired items retrieved successfully",
  })
  async getExpiredItems(@Query("vendorId") vendorId: string) {
    return this.inventoryService.getExpiredItems(vendorId);
  }

  @Get("expiring-soon")
  @RequirePermissions("inventory.read")
  @ApiOperation({ summary: "Get items expiring soon for a vendor" })
  @ApiQuery({ name: "vendorId", description: "Vendor ID" })
  @ApiQuery({ name: "days", description: "Number of days", required: false })
  @ApiResponse({
    status: 200,
    description: "Expiring soon items retrieved successfully",
  })
  async getExpiringSoonItems(
    @Query("vendorId") vendorId: string,
    @Query("days") days?: string,
  ) {
    const daysNumber = days ? parseInt(days, 10) : 30;
    return this.inventoryService.getExpiringSoonItems(vendorId, daysNumber);
  }

  @Get(":id")
  @RequirePermissions("inventory.read")
  @ApiOperation({ summary: "Get inventory by ID" })
  @ApiParam({ name: "id", description: "Inventory ID" })
  @ApiResponse({ status: 200, description: "Inventory retrieved successfully" })
  @ApiResponse({ status: 404, description: "Inventory not found" })
  async findOne(@Param("id") id: string) {
    return this.inventoryService.findOne(id);
  }

  @Get(":id/adjustments")
  @RequirePermissions("inventory.read")
  @ApiOperation({ summary: "Get adjustment history for inventory" })
  @ApiParam({ name: "id", description: "Inventory ID" })
  @ApiResponse({
    status: 200,
    description: "Adjustment history retrieved successfully",
  })
  async getAdjustmentHistory(@Param("id") id: string) {
    return this.inventoryService.getAdjustmentHistory(id);
  }

  @Patch(":id")
  @RequirePermissions("inventory.update")
  @ApiOperation({ summary: "Update inventory" })
  @ApiParam({ name: "id", description: "Inventory ID" })
  @ApiResponse({ status: 200, description: "Inventory updated successfully" })
  @ApiResponse({ status: 404, description: "Inventory not found" })
  async update(
    @Param("id") id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.inventoryService.update(id, updateInventoryDto);
  }

  @Post("adjust")
  @RequirePermissions("inventory.adjust")
  @ApiOperation({ summary: "Adjust inventory quantity" })
  @ApiResponse({ status: 201, description: "Inventory adjusted successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  async adjustInventory(
    @Body() createAdjustmentDto: CreateAdjustmentDto,
    @Request() req: any,
  ) {
    return this.inventoryService.adjustInventory(
      createAdjustmentDto,
      req.user.id,
    );
  }

  @Post(":id/reserve")
  @RequirePermissions("inventory.update")
  @ApiOperation({ summary: "Reserve stock" })
  @ApiParam({ name: "id", description: "Inventory ID" })
  @ApiResponse({ status: 200, description: "Stock reserved successfully" })
  @ApiResponse({ status: 400, description: "Insufficient stock" })
  async reserveStock(
    @Param("id") id: string,
    @Body() body: { productId: string; vendorId: string; quantity: number },
  ) {
    return this.inventoryService.reserveStock(
      body.productId,
      body.vendorId,
      body.quantity,
    );
  }

  @Post(":id/release-reserved")
  @RequirePermissions("inventory.update")
  @ApiOperation({ summary: "Release reserved stock" })
  @ApiParam({ name: "id", description: "Inventory ID" })
  @ApiResponse({
    status: 200,
    description: "Reserved stock released successfully",
  })
  async releaseReservedStock(
    @Param("id") id: string,
    @Body() body: { productId: string; vendorId: string; quantity: number },
  ) {
    return this.inventoryService.releaseReservedStock(
      body.productId,
      body.vendorId,
      body.quantity,
    );
  }

  @Delete(":id")
  @RequirePermissions("inventory.delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete inventory" })
  @ApiParam({ name: "id", description: "Inventory ID" })
  @ApiResponse({ status: 204, description: "Inventory deleted successfully" })
  @ApiResponse({ status: 404, description: "Inventory not found" })
  async remove(@Param("id") id: string) {
    await this.inventoryService.remove(id);
  }
}
