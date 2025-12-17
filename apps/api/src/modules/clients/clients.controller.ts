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
import { ClientsService } from "./clients.service";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermissions } from "../../common/decorators/permissions.decorator";

@ApiTags("Clients")
@Controller("clients")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @RequirePermissions("clients.create")
  @ApiOperation({ summary: "Create a new client" })
  @ApiResponse({ status: 201, description: "Client created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  async create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @Post("import")
  @RequirePermissions("clients.create")
  @ApiOperation({ summary: "Import multiple clients" })
  @ApiResponse({ status: 201, description: "Clients imported successfully" })
  async importClients(@Body() clients: CreateClientDto[]) {
    return this.clientsService.importClients(clients);
  }

  @Get("export")
  @RequirePermissions("clients.read")
  @ApiOperation({ summary: "Export clients" })
  @ApiQuery({ name: "vendorId", required: true })
  @ApiResponse({ status: 200, description: "Clients exported successfully" })
  async exportClients(@Query("vendorId") vendorId: string) {
    return this.clientsService.exportClients(vendorId);
  }

  @Get()
  @RequirePermissions("clients.read")
  @ApiOperation({ summary: "Get all clients" })
  @ApiQuery({ name: "vendorId", required: false })
  @ApiQuery({ name: "isActive", required: false, type: Boolean })
  @ApiResponse({ status: 200, description: "Clients retrieved successfully" })
  async findAll(
    @Query("vendorId") vendorId?: string,
    @Query("isActive") isActive?: string,
  ) {
    const isActiveBoolean =
      isActive === "true" ? true : isActive === "false" ? false : undefined;
    return this.clientsService.findAll(vendorId, isActiveBoolean);
  }

  @Get(":id")
  @RequirePermissions("clients.read")
  @ApiOperation({ summary: "Get client by ID" })
  @ApiParam({ name: "id", description: "Client ID" })
  @ApiResponse({ status: 200, description: "Client retrieved successfully" })
  @ApiResponse({ status: 404, description: "Client not found" })
  async findOne(@Param("id") id: string) {
    return this.clientsService.findOne(id);
  }

  @Get(":id/balance")
  @RequirePermissions("clients.read")
  @ApiOperation({ summary: "Get client balance" })
  @ApiParam({ name: "id", description: "Client ID" })
  @ApiResponse({ status: 200, description: "Balance retrieved successfully" })
  async getBalance(@Param("id") id: string) {
    const balance = await this.clientsService.getClientBalance(id);
    return { balance };
  }

  @Get(":id/transactions")
  @RequirePermissions("clients.read")
  @ApiOperation({ summary: "Get client transactions" })
  @ApiParam({ name: "id", description: "Client ID" })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "offset", required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: "Transactions retrieved successfully",
  })
  async getTransactions(
    @Param("id") id: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const offsetNum = offset ? parseInt(offset, 10) : 0;
    return this.clientsService.getTransactions(id, limitNum, offsetNum);
  }

  @Post(":id/transactions")
  @RequirePermissions("clients.update")
  @ApiOperation({ summary: "Add a transaction to client ledger" })
  @ApiParam({ name: "id", description: "Client ID" })
  @ApiResponse({ status: 201, description: "Transaction added successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  async addTransaction(
    @Param("id") id: string,
    @Body() createTransactionDto: CreateTransactionDto,
    @Request() req: any,
  ) {
    return this.clientsService.addTransaction(
      id,
      createTransactionDto,
      req.user.id,
    );
  }

  @Patch(":id")
  @RequirePermissions("clients.update")
  @ApiOperation({ summary: "Update client" })
  @ApiParam({ name: "id", description: "Client ID" })
  @ApiResponse({ status: 200, description: "Client updated successfully" })
  @ApiResponse({ status: 404, description: "Client not found" })
  async update(
    @Param("id") id: string,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return this.clientsService.update(id, updateClientDto);
  }

  @Delete(":id")
  @RequirePermissions("clients.delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete client" })
  @ApiParam({ name: "id", description: "Client ID" })
  @ApiResponse({ status: 204, description: "Client deleted successfully" })
  @ApiResponse({ status: 404, description: "Client not found" })
  async remove(@Param("id") id: string) {
    await this.clientsService.remove(id);
  }
}
