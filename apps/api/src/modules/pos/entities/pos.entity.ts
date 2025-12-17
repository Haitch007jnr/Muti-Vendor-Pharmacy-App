import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

export enum PosSessionStatus {
  OPEN = "open",
  CLOSED = "closed",
}

export enum PaymentMethod {
  CARD = "card",
  BANK_TRANSFER = "bank_transfer",
  CASH = "cash",
  WALLET = "wallet",
}

@Entity("pos_sessions")
export class PosSession {
  @ApiProperty({ description: "Unique identifier" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ description: "Session number" })
  @Column({ type: "varchar", length: 50, unique: true, name: "session_number" })
  sessionNumber: string;

  @ApiProperty({ description: "Vendor ID" })
  @Column({ type: "uuid", name: "vendor_id" })
  vendorId: string;

  @ApiProperty({ description: "Cashier ID" })
  @Column({ type: "uuid", name: "cashier_id", nullable: true })
  cashierId: string;

  @ApiProperty({ description: "Session status", enum: PosSessionStatus })
  @Column({
    type: "enum",
    enum: PosSessionStatus,
    default: PosSessionStatus.OPEN,
  })
  status: PosSessionStatus;

  @ApiProperty({ description: "Opening balance" })
  @Column({
    type: "decimal",
    precision: 15,
    scale: 2,
    name: "opening_balance",
    default: 0,
  })
  openingBalance: number;

  @ApiProperty({ description: "Closing balance", required: false })
  @Column({
    type: "decimal",
    precision: 15,
    scale: 2,
    name: "closing_balance",
    nullable: true,
  })
  closingBalance: number;

  @ApiProperty({ description: "Expected balance", required: false })
  @Column({
    type: "decimal",
    precision: 15,
    scale: 2,
    name: "expected_balance",
    nullable: true,
  })
  expectedBalance: number;

  @ApiProperty({ description: "Cash sales" })
  @Column({
    type: "decimal",
    precision: 15,
    scale: 2,
    name: "cash_sales",
    default: 0,
  })
  cashSales: number;

  @ApiProperty({ description: "Card sales" })
  @Column({
    type: "decimal",
    precision: 15,
    scale: 2,
    name: "card_sales",
    default: 0,
  })
  cardSales: number;

  @ApiProperty({ description: "Bank transfer sales" })
  @Column({
    type: "decimal",
    precision: 15,
    scale: 2,
    name: "bank_transfer_sales",
    default: 0,
  })
  bankTransferSales: number;

  @ApiProperty({ description: "Total sales" })
  @Column({
    type: "decimal",
    precision: 15,
    scale: 2,
    name: "total_sales",
    default: 0,
  })
  totalSales: number;

  @ApiProperty({ description: "Total transactions" })
  @Column({ type: "int", name: "total_transactions", default: 0 })
  totalTransactions: number;

  @ApiProperty({ description: "Notes", required: false })
  @Column({ type: "text", nullable: true })
  notes: string;

  @ApiProperty({ description: "Opened timestamp" })
  @Column({
    type: "timestamp",
    name: "opened_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  openedAt: Date;

  @ApiProperty({ description: "Closed timestamp", required: false })
  @Column({ type: "timestamp", name: "closed_at", nullable: true })
  closedAt: Date;

  @ApiProperty({ description: "Creation timestamp" })
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @ApiProperty({ description: "Last update timestamp" })
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @OneToMany(() => PosTransaction, (transaction) => transaction.session)
  transactions: PosTransaction[];
}

@Entity("pos_transactions")
export class PosTransaction {
  @ApiProperty({ description: "Unique identifier" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ description: "Transaction number" })
  @Column({
    type: "varchar",
    length: 50,
    unique: true,
    name: "transaction_number",
  })
  transactionNumber: string;

  @ApiProperty({ description: "Session ID" })
  @Column({ type: "uuid", name: "session_id" })
  sessionId: string;

  @ApiProperty({ description: "Sales ID", required: false })
  @Column({ type: "uuid", name: "sales_id", nullable: true })
  salesId: string;

  @ApiProperty({ description: "Vendor ID" })
  @Column({ type: "uuid", name: "vendor_id" })
  vendorId: string;

  @ApiProperty({ description: "Cashier ID" })
  @Column({ type: "uuid", name: "cashier_id", nullable: true })
  cashierId: string;

  @ApiProperty({ description: "Customer ID", required: false })
  @Column({ type: "uuid", name: "customer_id", nullable: true })
  customerId: string;

  @ApiProperty({ description: "Subtotal" })
  @Column({ type: "decimal", precision: 15, scale: 2 })
  subtotal: number;

  @ApiProperty({ description: "Discount amount" })
  @Column({
    type: "decimal",
    precision: 15,
    scale: 2,
    name: "discount_amount",
    default: 0,
  })
  discountAmount: number;

  @ApiProperty({ description: "Tax amount" })
  @Column({
    type: "decimal",
    precision: 15,
    scale: 2,
    name: "tax_amount",
    default: 0,
  })
  taxAmount: number;

  @ApiProperty({ description: "Total amount" })
  @Column({ type: "decimal", precision: 15, scale: 2, name: "total_amount" })
  totalAmount: number;

  @ApiProperty({ description: "Amount paid" })
  @Column({ type: "decimal", precision: 15, scale: 2, name: "amount_paid" })
  amountPaid: number;

  @ApiProperty({ description: "Change amount" })
  @Column({
    type: "decimal",
    precision: 15,
    scale: 2,
    name: "change_amount",
    default: 0,
  })
  changeAmount: number;

  @ApiProperty({ description: "Payment method", enum: PaymentMethod })
  @Column({ type: "enum", enum: PaymentMethod, name: "payment_method" })
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: "Receipt printed" })
  @Column({ type: "boolean", name: "receipt_printed", default: false })
  receiptPrinted: boolean;

  @ApiProperty({ description: "Notes", required: false })
  @Column({ type: "text", nullable: true })
  notes: string;

  @ApiProperty({ description: "Creation timestamp" })
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @ManyToOne(() => PosSession, (session) => session.transactions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "session_id" })
  session: PosSession;
}
