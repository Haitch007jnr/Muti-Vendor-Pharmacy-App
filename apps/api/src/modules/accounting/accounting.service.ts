import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource, Between } from "typeorm";
import {
  Account,
  Transaction,
  TransactionType,
  TransactionCategory,
} from "./entities/account.entity";
import { CreateAccountDto } from "./dto/create-account.dto";
import { UpdateAccountDto } from "./dto/update-account.dto";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { BalanceTransferDto } from "./dto/balance-transfer.dto";

@Injectable()
export class AccountingService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly dataSource: DataSource,
  ) {}

  async createAccount(createAccountDto: CreateAccountDto): Promise<Account> {
    const account = this.accountRepository.create(createAccountDto);
    return await this.accountRepository.save(account);
  }

  async findAllAccounts(
    vendorId?: string,
    isActive?: boolean,
  ): Promise<Account[]> {
    const where: any = {};

    if (vendorId) {
      where.vendorId = vendorId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return await this.accountRepository.find({
      where,
      order: { createdAt: "DESC" },
    });
  }

  async findOneAccount(id: string): Promise<Account> {
    const account = await this.accountRepository.findOne({ where: { id } });

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    return account;
  }

  async updateAccount(
    id: string,
    updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    const account = await this.findOneAccount(id);
    Object.assign(account, updateAccountDto);
    return await this.accountRepository.save(account);
  }

  async removeAccount(id: string): Promise<void> {
    const account = await this.findOneAccount(id);

    // Check if account has balance
    if (account.balance !== 0) {
      throw new BadRequestException(
        "Cannot delete account with non-zero balance",
      );
    }

    await this.accountRepository.remove(account);
  }

  async createTransaction(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const account = await this.findOneAccount(createTransactionDto.accountId);

    // Calculate new balance
    let newBalance = account.balance;
    if (createTransactionDto.type === TransactionType.CREDIT) {
      newBalance += createTransactionDto.amount;
    } else if (createTransactionDto.type === TransactionType.DEBIT) {
      newBalance -= createTransactionDto.amount;

      // Check for sufficient balance
      if (newBalance < 0) {
        throw new BadRequestException("Insufficient account balance");
      }
    }

    // Create transaction
    const transaction = this.transactionRepository.create({
      ...createTransactionDto,
      balanceAfter: newBalance,
      category: createTransactionDto.category || TransactionCategory.OTHER,
    });

    // Update account balance
    account.balance = newBalance;

    // Save both in a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(account);
      const savedTransaction = await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();
      return savedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async balanceTransfer(
    balanceTransferDto: BalanceTransferDto,
  ): Promise<{ from: Transaction; to: Transaction }> {
    const { fromAccountId, toAccountId, amount, description, reference } =
      balanceTransferDto;

    if (fromAccountId === toAccountId) {
      throw new BadRequestException("Cannot transfer to the same account");
    }

    const fromAccount = await this.findOneAccount(fromAccountId);
    const toAccount = await this.findOneAccount(toAccountId);

    // Check sufficient balance
    if (fromAccount.balance < amount) {
      throw new BadRequestException("Insufficient balance in source account");
    }

    // Check accounts are active
    if (!fromAccount.isActive || !toAccount.isActive) {
      throw new BadRequestException(
        "Cannot transfer between inactive accounts",
      );
    }

    // Calculate new balances
    const fromNewBalance = fromAccount.balance - amount;
    const toNewBalance = toAccount.balance + amount;

    const transferReference = reference || `TRANSFER-${Date.now()}`;
    const transferDescription =
      description ||
      `Transfer from ${fromAccount.accountName} to ${toAccount.accountName}`;

    // Create transactions
    const fromTransaction = this.transactionRepository.create({
      accountId: fromAccountId,
      type: TransactionType.DEBIT,
      category: TransactionCategory.TRANSFER,
      amount,
      balanceAfter: fromNewBalance,
      description: transferDescription,
      reference: transferReference,
      metadata: { toAccountId, toAccountName: toAccount.accountName },
    });

    const toTransaction = this.transactionRepository.create({
      accountId: toAccountId,
      type: TransactionType.CREDIT,
      category: TransactionCategory.TRANSFER,
      amount,
      balanceAfter: toNewBalance,
      description: transferDescription,
      reference: transferReference,
      metadata: { fromAccountId, fromAccountName: fromAccount.accountName },
    });

    // Update balances
    fromAccount.balance = fromNewBalance;
    toAccount.balance = toNewBalance;

    // Execute transfer in a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(fromAccount);
      await queryRunner.manager.save(toAccount);
      const savedFromTransaction =
        await queryRunner.manager.save(fromTransaction);
      const savedToTransaction = await queryRunner.manager.save(toTransaction);
      await queryRunner.commitTransaction();

      return {
        from: savedFromTransaction,
        to: savedToTransaction,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getTransactionHistory(
    accountId: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ transactions: Transaction[]; total: number }> {
    const where: any = { accountId };

    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    }

    const [transactions, total] = await this.transactionRepository.findAndCount(
      {
        where,
        order: { createdAt: "DESC" },
        take: limit,
        skip: offset,
      },
    );

    return { transactions, total };
  }

  async getAccountBalance(accountId: string): Promise<number> {
    const account = await this.findOneAccount(accountId);
    return account.balance;
  }

  async getVendorTotalBalance(vendorId: string): Promise<number> {
    const result = await this.accountRepository
      .createQueryBuilder("account")
      .select("SUM(account.balance)", "total")
      .where("account.vendor_id = :vendorId", { vendorId })
      .andWhere("account.is_active = :isActive", { isActive: true })
      .getRawOne();

    return parseFloat(result?.total || "0");
  }

  async reconcileAccount(
    accountId: string,
  ): Promise<{ calculated: number; current: number; difference: number }> {
    const account = await this.findOneAccount(accountId);

    // Calculate balance from transactions
    const result = await this.transactionRepository
      .createQueryBuilder("transaction")
      .select(
        "SUM(CASE WHEN type = :credit THEN amount ELSE -amount END)",
        "calculated",
      )
      .where("transaction.account_id = :accountId", { accountId })
      .setParameter("credit", TransactionType.CREDIT)
      .getRawOne();

    const calculatedBalance = parseFloat(result?.calculated || "0");
    const currentBalance = account.balance;
    const difference = currentBalance - calculatedBalance;

    return {
      calculated: calculatedBalance,
      current: currentBalance,
      difference,
    };
  }

  async getAccountSummary(
    accountId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    account: Account;
    totalCredits: number;
    totalDebits: number;
    transactionCount: number;
    openingBalance: number;
    closingBalance: number;
  }> {
    const account = await this.findOneAccount(accountId);

    const queryBuilder = this.transactionRepository
      .createQueryBuilder("transaction")
      .where("transaction.account_id = :accountId", { accountId });

    if (startDate && endDate) {
      queryBuilder.andWhere(
        "transaction.created_at BETWEEN :startDate AND :endDate",
        {
          startDate,
          endDate,
        },
      );
    }

    const summary = await queryBuilder
      .select(
        "SUM(CASE WHEN type = :credit THEN amount ELSE 0 END)",
        "totalCredits",
      )
      .addSelect(
        "SUM(CASE WHEN type = :debit THEN amount ELSE 0 END)",
        "totalDebits",
      )
      .addSelect("COUNT(*)", "transactionCount")
      .setParameter("credit", TransactionType.CREDIT)
      .setParameter("debit", TransactionType.DEBIT)
      .getRawOne();

    const totalCredits = parseFloat(summary?.totalCredits || "0");
    const totalDebits = parseFloat(summary?.totalDebits || "0");
    const transactionCount = parseInt(summary?.transactionCount || "0", 10);

    // For opening balance, get the balance before the start date
    let openingBalance = 0;
    if (startDate) {
      const openingQuery = await this.transactionRepository
        .createQueryBuilder("transaction")
        .where("transaction.account_id = :accountId", { accountId })
        .andWhere("transaction.created_at < :startDate", { startDate })
        .orderBy("transaction.created_at", "DESC")
        .limit(1)
        .getOne();

      openingBalance = openingQuery?.balanceAfter || 0;
    }

    return {
      account,
      totalCredits,
      totalDebits,
      transactionCount,
      openingBalance,
      closingBalance: account.balance,
    };
  }
}
