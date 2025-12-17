import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum AccountType {
  CASH = 'cash',
  BANK = 'bank',
  MOBILE_MONEY = 'mobile_money',
  CREDIT_CARD = 'credit_card',
  SAVINGS = 'savings',
  INVESTMENT = 'investment',
  OTHER = 'other',
}

@Entity('accounts')
export class Account {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Vendor ID' })
  @Column({ type: 'uuid', name: 'vendor_id' })
  vendorId: string;

  @ApiProperty({ description: 'Account name' })
  @Column({ type: 'varchar', length: 255, name: 'account_name' })
  accountName: string;

  @ApiProperty({ description: 'Account type', enum: AccountType })
  @Column({ type: 'varchar', length: 50, name: 'account_type' })
  accountType: AccountType;

  @ApiProperty({ description: 'Current balance' })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: number;

  @ApiProperty({ description: 'Currency code', default: 'NGN' })
  @Column({ type: 'varchar', length: 3, default: 'NGN' })
  currency: string;

  @ApiProperty({ description: 'Is account active' })
  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Transaction, (transaction) => transaction.account)
  transactions: Transaction[];
}

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export enum TransactionCategory {
  SALE = 'sale',
  PURCHASE = 'purchase',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
  REFUND = 'refund',
  SALARY = 'salary',
  LOAN = 'loan',
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  OTHER = 'other',
}

@Entity('transactions')
export class Transaction {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Account ID' })
  @Column({ type: 'uuid', name: 'account_id' })
  accountId: string;

  @ApiProperty({ description: 'Transaction type', enum: TransactionType })
  @Column({ type: 'varchar', length: 10 })
  type: TransactionType;

  @ApiProperty({ description: 'Transaction category', enum: TransactionCategory })
  @Column({ type: 'varchar', length: 50, default: TransactionCategory.OTHER })
  category: TransactionCategory;

  @ApiProperty({ description: 'Transaction amount' })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @ApiProperty({ description: 'Balance after transaction' })
  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'balance_after' })
  balanceAfter: number;

  @ApiProperty({ description: 'Transaction description', required: false })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Reference number', required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  reference: string;

  @ApiProperty({ description: 'Additional metadata', required: false })
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Account, (account) => account.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;
}
