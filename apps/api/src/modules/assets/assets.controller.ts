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
import { AssetsService } from "./assets.service";
import { CreateAssetDto } from "./dto/create-asset.dto";
import { UpdateAssetDto } from "./dto/update-asset.dto";
import { QueryAssetDto } from "./dto/query-asset.dto";
import { CreateAssetCategoryDto } from "./dto/create-asset-category.dto";
import { UpdateAssetCategoryDto } from "./dto/update-asset-category.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";

@ApiTags("Assets")
@Controller("assets")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  // Asset Category Endpoints
  @Post("categories")
  @RequirePermissions("assets.create")
  @ApiOperation({ summary: "Create a new asset category" })
  @ApiResponse({
    status: 201,
    description: "Asset category created successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async createCategory(@Body() createCategoryDto: CreateAssetCategoryDto) {
    return this.assetsService.createCategory(createCategoryDto);
  }

  @Get("categories")
  @RequirePermissions("assets.read")
  @ApiOperation({ summary: "Get all asset categories" })
  @ApiResponse({
    status: 200,
    description: "Asset categories retrieved successfully",
  })
  async findAllCategories(@Query("vendorId") vendorId: string) {
    return this.assetsService.findAllCategories(vendorId);
  }

  @Get("categories/:id")
  @RequirePermissions("assets.read")
  @ApiOperation({ summary: "Get asset category by ID" })
  @ApiParam({ name: "id", description: "Asset category ID" })
  @ApiResponse({
    status: 200,
    description: "Asset category retrieved successfully",
  })
  @ApiResponse({ status: 404, description: "Asset category not found" })
  async findOneCategory(@Param("id") id: string) {
    return this.assetsService.findOneCategory(id);
  }

  @Patch("categories/:id")
  @RequirePermissions("assets.update")
  @ApiOperation({ summary: "Update asset category" })
  @ApiParam({ name: "id", description: "Asset category ID" })
  @ApiResponse({
    status: 200,
    description: "Asset category updated successfully",
  })
  @ApiResponse({ status: 404, description: "Asset category not found" })
  async updateCategory(
    @Param("id") id: string,
    @Body() updateCategoryDto: UpdateAssetCategoryDto,
  ) {
    return this.assetsService.updateCategory(id, updateCategoryDto);
  }

  @Delete("categories/:id")
  @RequirePermissions("assets.delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete asset category" })
  @ApiParam({ name: "id", description: "Asset category ID" })
  @ApiResponse({
    status: 204,
    description: "Asset category deleted successfully",
  })
  @ApiResponse({ status: 404, description: "Asset category not found" })
  async removeCategory(@Param("id") id: string) {
    await this.assetsService.removeCategory(id);
  }

  // Asset Endpoints
  @Post()
  @RequirePermissions("assets.create")
  @ApiOperation({ summary: "Create a new asset" })
  @ApiResponse({ status: 201, description: "Asset created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetsService.create(createAssetDto);
  }

  @Get()
  @RequirePermissions("assets.read")
  @ApiOperation({ summary: "Get all assets with filters" })
  @ApiResponse({ status: 200, description: "Assets retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async findAll(@Query() query: QueryAssetDto) {
    return this.assetsService.findAll(query);
  }

  @Get("summary")
  @RequirePermissions("assets.read")
  @ApiOperation({ summary: "Get asset summary statistics" })
  @ApiResponse({ status: 200, description: "Summary retrieved successfully" })
  async getAssetSummary(@Query("vendorId") vendorId: string) {
    return this.assetsService.getAssetSummary(vendorId);
  }

  @Get(":id")
  @RequirePermissions("assets.read")
  @ApiOperation({ summary: "Get asset by ID" })
  @ApiParam({ name: "id", description: "Asset ID" })
  @ApiResponse({ status: 200, description: "Asset retrieved successfully" })
  @ApiResponse({ status: 404, description: "Asset not found" })
  async findOne(@Param("id") id: string) {
    return this.assetsService.findOne(id);
  }

  @Patch(":id")
  @RequirePermissions("assets.update")
  @ApiOperation({ summary: "Update asset" })
  @ApiParam({ name: "id", description: "Asset ID" })
  @ApiResponse({ status: 200, description: "Asset updated successfully" })
  @ApiResponse({ status: 404, description: "Asset not found" })
  async update(
    @Param("id") id: string,
    @Body() updateAssetDto: UpdateAssetDto,
  ) {
    return this.assetsService.update(id, updateAssetDto);
  }

  @Delete(":id")
  @RequirePermissions("assets.delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete asset" })
  @ApiParam({ name: "id", description: "Asset ID" })
  @ApiResponse({ status: 204, description: "Asset deleted successfully" })
  @ApiResponse({ status: 404, description: "Asset not found" })
  async remove(@Param("id") id: string) {
    await this.assetsService.remove(id);
  }

  // Depreciation Endpoints
  @Post(":assetId/depreciation/:year/:month")
  @RequirePermissions("assets.create")
  @ApiOperation({ summary: "Calculate monthly depreciation for an asset" })
  @ApiParam({ name: "assetId", description: "Asset ID" })
  @ApiParam({ name: "year", description: "Year" })
  @ApiParam({ name: "month", description: "Month (1-12)" })
  @ApiResponse({
    status: 201,
    description: "Depreciation calculated successfully",
  })
  async calculateMonthlyDepreciation(
    @Param("assetId") assetId: string,
    @Param("year") year: number,
    @Param("month") month: number,
  ) {
    return this.assetsService.calculateMonthlyDepreciation(
      assetId,
      Number(year),
      Number(month),
    );
  }

  @Get(":assetId/depreciation-schedule")
  @RequirePermissions("assets.read")
  @ApiOperation({ summary: "Get depreciation schedule for an asset" })
  @ApiParam({ name: "assetId", description: "Asset ID" })
  @ApiResponse({
    status: 200,
    description: "Depreciation schedule retrieved successfully",
  })
  async getDepreciationSchedule(@Param("assetId") assetId: string) {
    return this.assetsService.getDepreciationSchedule(assetId);
  }
}
