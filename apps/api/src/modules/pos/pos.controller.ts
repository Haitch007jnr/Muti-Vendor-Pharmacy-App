import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PosService } from './pos.service';
import { CreatePosSessionDto, CreatePosTransactionDto, ClosePosSessionDto } from './dto/pos.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('POS')
@Controller('pos')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class PosController {
  constructor(private readonly posService: PosService) {}

  // Session Management
  @Post('sessions')
  @RequirePermissions('pos.create')
  @ApiOperation({ summary: 'Open a new POS session' })
  @ApiResponse({ status: 201, description: 'Session opened successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async openSession(@Body() createPosSessionDto: CreatePosSessionDto, @Request() req: any) {
    return this.posService.openSession(createPosSessionDto, req.user.id);
  }

  @Post('sessions/:id/close')
  @RequirePermissions('pos.close')
  @ApiOperation({ summary: 'Close a POS session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session closed successfully' })
  @ApiResponse({ status: 400, description: 'Session already closed' })
  async closeSession(@Param('id') id: string, @Body() closePosSessionDto: ClosePosSessionDto) {
    return this.posService.closeSession(id, closePosSessionDto);
  }

  @Get('sessions/active')
  @RequirePermissions('pos.read')
  @ApiOperation({ summary: 'Get active POS sessions' })
  @ApiQuery({ name: 'vendorId', description: 'Vendor ID' })
  @ApiResponse({ status: 200, description: 'Active sessions retrieved successfully' })
  async getActiveSessions(@Query('vendorId') vendorId: string) {
    return this.posService.getActiveSessions(vendorId);
  }

  @Get('sessions/my-sessions')
  @RequirePermissions('pos.read')
  @ApiOperation({ summary: 'Get cashier sessions' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully' })
  async getMySessions(@Request() req: any, @Query('limit') limit?: number) {
    return this.posService.getSessionsByCashier(req.user.id, limit);
  }

  @Get('sessions/:id')
  @RequirePermissions('pos.read')
  @ApiOperation({ summary: 'Get POS session details' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async getSession(@Param('id') id: string) {
    return this.posService.findSession(id);
  }

  @Get('sessions/:id/report')
  @RequirePermissions('pos.read')
  @ApiOperation({ summary: 'Get session report' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Report generated successfully' })
  async getSessionReport(@Param('id') id: string) {
    return this.posService.getSessionReport(id);
  }

  // Transactions
  @Post('transactions')
  @RequirePermissions('pos.transaction')
  @ApiOperation({ summary: 'Create a new POS transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createTransaction(
    @Body() createPosTransactionDto: CreatePosTransactionDto,
    @Request() req: any,
  ) {
    return this.posService.createTransaction(createPosTransactionDto, req.user.id);
  }

  @Get('transactions/:id')
  @RequirePermissions('pos.read')
  @ApiOperation({ summary: 'Get transaction details' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({ status: 200, description: 'Transaction retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getTransaction(@Param('id') id: string) {
    return this.posService.findTransaction(id);
  }

  @Get('sessions/:id/transactions')
  @RequirePermissions('pos.read')
  @ApiOperation({ summary: 'Get all transactions for a session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  async getSessionTransactions(@Param('id') id: string) {
    return this.posService.getSessionTransactions(id);
  }

  @Post('transactions/:id/print-receipt')
  @RequirePermissions('pos.transaction')
  @ApiOperation({ summary: 'Mark receipt as printed' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({ status: 200, description: 'Receipt marked as printed' })
  async markReceiptPrinted(@Param('id') id: string) {
    return this.posService.markReceiptPrinted(id);
  }

  // Product Search
  @Get('products/search')
  @RequirePermissions('pos.read')
  @ApiOperation({ summary: 'Search products for POS (by SKU, barcode, or name)' })
  @ApiQuery({ name: 'vendorId', description: 'Vendor ID' })
  @ApiQuery({ name: 'q', description: 'Search term (SKU, barcode, or product name)' })
  @ApiQuery({ name: 'limit', description: 'Number of results', required: false })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async searchProducts(
    @Query('vendorId') vendorId: string,
    @Query('q') searchTerm: string,
    @Query('limit') limit?: number,
  ) {
    return this.posService.searchProducts(vendorId, searchTerm, limit);
  }
}
