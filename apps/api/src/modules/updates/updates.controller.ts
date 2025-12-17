import {
  Controller,
  Get,
  Post,
  Body,
  Param,
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
import { UpdatesService } from "./updates.service";
import {
  CheckUpdateDto,
  ApplyUpdateDto,
  CreateUpdateDto,
} from "./dto/update.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("Updates")
@Controller("updates")
export class UpdatesController {
  constructor(private readonly updatesService: UpdatesService) {}

  @Get("check")
  @ApiOperation({ summary: "Check for available updates" })
  @ApiResponse({
    status: 200,
    description: "Returns update availability information",
  })
  async checkForUpdates(@Body() checkUpdateDto?: CheckUpdateDto) {
    return this.updatesService.checkForUpdates(checkUpdateDto);
  }

  @Post("apply")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Apply an update" })
  @ApiResponse({
    status: 200,
    description: "Update application result",
  })
  @ApiResponse({
    status: 404,
    description: "Update not found",
  })
  @ApiResponse({
    status: 409,
    description: "Update already applied or in progress",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
  })
  async applyUpdate(@Body() applyUpdateDto: ApplyUpdateDto) {
    return this.updatesService.applyUpdate(applyUpdateDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all updates" })
  @ApiResponse({
    status: 200,
    description: "Returns all updates",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
  })
  async getAllUpdates() {
    return this.updatesService.getAllUpdates();
  }

  @Get("history")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get update history" })
  @ApiResponse({
    status: 200,
    description: "Returns completed updates history",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
  })
  async getUpdateHistory() {
    return this.updatesService.getUpdateHistory();
  }

  @Get(":version")
  @ApiOperation({ summary: "Get update by version" })
  @ApiParam({
    name: "version",
    description: "Update version",
    example: "1.1.0",
  })
  @ApiResponse({
    status: 200,
    description: "Returns update details",
  })
  @ApiResponse({
    status: 404,
    description: "Update not found",
  })
  async getUpdateByVersion(@Param("version") version: string) {
    return this.updatesService.getUpdateByVersion(version);
  }

  @Post("create")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new update entry" })
  @ApiResponse({
    status: 201,
    description: "Update entry created successfully",
  })
  @ApiResponse({
    status: 409,
    description: "Update version already exists",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
  })
  async createUpdate(@Body() createUpdateDto: CreateUpdateDto) {
    return this.updatesService.createUpdate(createUpdateDto);
  }

  @Post("rollback/:version")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Rollback an update" })
  @ApiParam({
    name: "version",
    description: "Update version to rollback",
    example: "1.1.0",
  })
  @ApiResponse({
    status: 200,
    description: "Update rollback result",
  })
  @ApiResponse({
    status: 404,
    description: "Update not found",
  })
  @ApiResponse({
    status: 400,
    description: "Cannot rollback update in current state",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
  })
  async rollbackUpdate(@Param("version") version: string) {
    return this.updatesService.rollbackUpdate(version);
  }
}
