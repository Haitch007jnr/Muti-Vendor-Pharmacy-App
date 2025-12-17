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
import { DepartmentsService } from "./departments.service";
import { CreateDepartmentDto } from "./dto/create-department.dto";
import { UpdateDepartmentDto } from "./dto/update-department.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";

@ApiTags("Departments")
@Controller("departments")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @RequirePermissions("departments.create")
  @ApiOperation({ summary: "Create a new department" })
  @ApiResponse({ status: 201, description: "Department created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  async create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  @RequirePermissions("departments.read")
  @ApiOperation({ summary: "Get all departments" })
  @ApiQuery({ name: "vendorId", required: false })
  @ApiQuery({ name: "isActive", required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: "Departments retrieved successfully",
  })
  async findAll(
    @Query("vendorId") vendorId?: string,
    @Query("isActive") isActive?: string,
  ) {
    const isActiveBoolean =
      isActive === "true" ? true : isActive === "false" ? false : undefined;
    return this.departmentsService.findAll(vendorId, isActiveBoolean);
  }

  @Get(":id")
  @RequirePermissions("departments.read")
  @ApiOperation({ summary: "Get department by ID" })
  @ApiParam({ name: "id", description: "Department ID" })
  @ApiResponse({
    status: 200,
    description: "Department retrieved successfully",
  })
  @ApiResponse({ status: 404, description: "Department not found" })
  async findOne(@Param("id") id: string) {
    return this.departmentsService.findOne(id);
  }

  @Patch(":id")
  @RequirePermissions("departments.update")
  @ApiOperation({ summary: "Update department" })
  @ApiParam({ name: "id", description: "Department ID" })
  @ApiResponse({ status: 200, description: "Department updated successfully" })
  @ApiResponse({ status: 404, description: "Department not found" })
  async update(
    @Param("id") id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @Delete(":id")
  @RequirePermissions("departments.delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete department" })
  @ApiParam({ name: "id", description: "Department ID" })
  @ApiResponse({ status: 204, description: "Department deleted successfully" })
  @ApiResponse({ status: 404, description: "Department not found" })
  async remove(@Param("id") id: string) {
    await this.departmentsService.remove(id);
  }
}
