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
  ApiQuery,
} from "@nestjs/swagger";
import { SuppliersService } from "./suppliers.service";
import { CreateSupplierDto } from "./dto/create-supplier.dto";
import { UpdateSupplierDto } from "./dto/update-supplier.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";

@ApiTags("Suppliers")
@Controller("suppliers")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @RequirePermissions("suppliers.create")
  @ApiOperation({ summary: "Create a new supplier" })
  @ApiResponse({ status: 201, description: "Supplier created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  async create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.suppliersService.create(createSupplierDto);
  }

  @Post("import")
  @RequirePermissions("suppliers.create")
  @ApiOperation({ summary: "Import multiple suppliers" })
  @ApiResponse({ status: 201, description: "Suppliers imported successfully" })
  async importSuppliers(@Body() suppliers: CreateSupplierDto[]) {
    return this.suppliersService.importSuppliers(suppliers);
  }

  @Get("export")
  @RequirePermissions("suppliers.read")
  @ApiOperation({ summary: "Export suppliers" })
  @ApiQuery({ name: "vendorId", required: true })
  @ApiResponse({ status: 200, description: "Suppliers exported successfully" })
  async exportSuppliers(@Query("vendorId") vendorId: string) {
    return this.suppliersService.exportSuppliers(vendorId);
  }

  @Get()
  @RequirePermissions("suppliers.read")
  @ApiOperation({ summary: "Get all suppliers" })
  @ApiQuery({ name: "vendorId", required: false })
  @ApiQuery({ name: "isActive", required: false, type: Boolean })
  @ApiResponse({ status: 200, description: "Suppliers retrieved successfully" })
  async findAll(
    @Query("vendorId") vendorId?: string,
    @Query("isActive") isActive?: string,
  ) {
    const isActiveBoolean =
      isActive === "true" ? true : isActive === "false" ? false : undefined;
    return this.suppliersService.findAll(vendorId, isActiveBoolean);
  }

  @Get(":id")
  @RequirePermissions("suppliers.read")
  @ApiOperation({ summary: "Get supplier by ID" })
  @ApiParam({ name: "id", description: "Supplier ID" })
  @ApiResponse({ status: 200, description: "Supplier retrieved successfully" })
  @ApiResponse({ status: 404, description: "Supplier not found" })
  async findOne(@Param("id") id: string) {
    return this.suppliersService.findOne(id);
  }

  @Patch(":id")
  @RequirePermissions("suppliers.update")
  @ApiOperation({ summary: "Update supplier" })
  @ApiParam({ name: "id", description: "Supplier ID" })
  @ApiResponse({ status: 200, description: "Supplier updated successfully" })
  @ApiResponse({ status: 404, description: "Supplier not found" })
  async update(
    @Param("id") id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(id, updateSupplierDto);
  }

  @Delete(":id")
  @RequirePermissions("suppliers.delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete supplier" })
  @ApiParam({ name: "id", description: "Supplier ID" })
  @ApiResponse({ status: 204, description: "Supplier deleted successfully" })
  @ApiResponse({ status: 404, description: "Supplier not found" })
  async remove(@Param("id") id: string) {
    await this.suppliersService.remove(id);
  }
}
