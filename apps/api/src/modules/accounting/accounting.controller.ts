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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AccountingService } from './accounting.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { BalanceTransferDto } from './dto/balance-transfer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Accounting')
@Controller('accounting')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  // Account Management
  @Post('accounts')
  @RequirePermissions('accounting.create')
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createAccount(@Body() createAccountDto: CreateAccountDto) {
    return this.accountingService.createAccount(createAccountDto);
  }

  @Get('accounts')
  @RequirePermissions('accounting.read')
  @ApiOperation({ summary: 'Get all accounts with filters' })
  @ApiQuery({ name: 'vendorId', required: false, description: 'Filter by vendor ID' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status' })
  @ApiResponse({ status: 200, description: 'Accounts retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAllAccounts(
    @Query('vendorId') vendorId?: string,
    @Query('isActive') isActive?: string,
  ) {
    const isActiveBoolean = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.accountingService.findAllAccounts(vendorId, isActiveBoolean);
  }

  @Get('accounts/:id')
  @RequirePermissions('accounting.read')
  @ApiOperation({ summary: 'Get account by ID' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({ status: 200, description: 'Account retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async findOneAccount(@Param('id') id: string) {
    return this.accountingService.findOneAccount(id);
  }

  @Get('accounts/:id/balance')
  @RequirePermissions('accounting.read')
  @ApiOperation({ summary: 'Get account balance' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({ status: 200, description: 'Balance retrieved successfully' })
  async getAccountBalance(@Param('id') id: string) {
    const balance = await this.accountingService.getAccountBalance(id);
    return { accountId: id, balance };
  }

  @Get('accounts/:id/summary')
  @RequirePermissions('accounting.read')
  @ApiOperation({ summary: 'Get account summary' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for summary' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for summary' })
  @ApiResponse({ status: 200, description: 'Account summary retrieved successfully' })
  async getAccountSummary(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.accountingService.getAccountSummary(id, start, end);
  }

  @Get('accounts/:id/reconcile')
  @RequirePermissions('accounting.reconcile')
  @ApiOperation({ summary: 'Reconcile account balance' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({ status: 200, description: 'Account reconciled successfully' })
  async reconcileAccount(@Param('id') id: string) {
    return this.accountingService.reconcileAccount(id);
  }

  @Patch('accounts/:id')
  @RequirePermissions('accounting.update')
  @ApiOperation({ summary: 'Update account' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({ status: 200, description: 'Account updated successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async updateAccount(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountingService.updateAccount(id, updateAccountDto);
  }

  @Delete('accounts/:id')
  @RequirePermissions('accounting.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete account' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({ status: 204, description: 'Account deleted successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete account with non-zero balance' })
  async removeAccount(@Param('id') id: string) {
    await this.accountingService.removeAccount(id);
  }

  // Transaction Management
  @Post('transactions')
  @RequirePermissions('accounting.create')
  @ApiOperation({ summary: 'Create a transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createTransaction(@Body() createTransactionDto: CreateTransactionDto) {
    return this.accountingService.createTransaction(createTransactionDto);
  }

  @Get('transactions')
  @RequirePermissions('accounting.read')
  @ApiOperation({ summary: 'Get transaction history for an account' })
  @ApiQuery({ name: 'accountId', description: 'Account ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date filter' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date filter' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of transactions to return' })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of transactions to skip' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  async getTransactionHistory(
    @Query('accountId') accountId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const offsetNum = offset ? parseInt(offset, 10) : 0;

    return this.accountingService.getTransactionHistory(accountId, start, end, limitNum, offsetNum);
  }

  // Balance Transfer
  @Post('transfer')
  @RequirePermissions('accounting.transfer')
  @ApiOperation({ summary: 'Transfer balance between accounts' })
  @ApiResponse({ status: 201, description: 'Balance transferred successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async balanceTransfer(@Body() balanceTransferDto: BalanceTransferDto) {
    return this.accountingService.balanceTransfer(balanceTransferDto);
  }

  // Vendor Reports
  @Get('vendors/:vendorId/total-balance')
  @RequirePermissions('accounting.read')
  @ApiOperation({ summary: 'Get total balance for all vendor accounts' })
  @ApiParam({ name: 'vendorId', description: 'Vendor ID' })
  @ApiResponse({ status: 200, description: 'Total balance retrieved successfully' })
  async getVendorTotalBalance(@Param('vendorId') vendorId: string) {
    const totalBalance = await this.accountingService.getVendorTotalBalance(vendorId);
    return { vendorId, totalBalance };
  }
}
