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

export enum SalesStatus {
  QUOTATION = "quotation",
  CONFIRMED = "confirmed",
  INVOICED = "invoiced",
  PAID = "paid",
  CANCELLED = "cancelled",
  RETURNED = "returned",
}

export enum PaymentStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export enum PaymentMethod {
  CARD = "card",
  BANK_TRANSFER = "bank_transfer",
  CASH = "cash",
  WALLET = "wallet",
}

@Entity("sales")
export class Sales {
  @ApiProperty({ description: "Unique identifier" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ description: "Sales number" })
  @Column({ type: "varchar", length: 50, unique: true, name: "sales_number" })
  salesNumber: string;

  @ApiProperty({ description: "Invoice number", required: false })
  @Column({
    type: "varchar",
    length: 50,
    unique: true,
    name: "invoice_number",
    nullable: true,
  })
  invoiceNumber: string;

  @ApiProperty({ description: "Vendor ID" })
  @Column({ type: "uuid", name: "vendor_id" })
  vendorId: string;

  @ApiProperty({ description: "Client ID", required: false })
  @Column({ type: "uuid", name: "client_id", nullable: true })
  clientId: string;

  @ApiProperty({ description: "Customer ID", required: false })
  @Column({ type: "uuid", name: "customer_id", nullable: true })
  customerId: string;

  @ApiProperty({ description: "Sales status", enum: SalesStatus })
  @Column({ type: "enum", enum: SalesStatus, default: SalesStatus.QUOTATION })
  status: SalesStatus;

  @ApiProperty({ description: "Sales date" })
  @Column({ type: "date", name: "sales_date" })
  salesDate: Date;

  @ApiProperty({ description: "Due date", required: false })
  @Column({ type: "date", name: "due_date", nullable: true })
  dueDate: Date;

  @ApiProperty({ description: "Subtotal amount" })
  @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
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

  @ApiProperty({ description: "Paid amount" })
  @Column({
    type: "decimal",
    precision: 15,
    scale: 2,
    name: "paid_amount",
    default: 0,
  })
  paidAmount: number;

  @ApiProperty({ description: "Balance due" })
  @Column({
    type: "decimal",
    precision: 15,
    scale: 2,
    name: "balance_due",
    default: 0,
  })
  balanceDue: number;

  @ApiProperty({
    description: "Payment method",
    enum: PaymentMethod,
    required: false,
  })
  @Column({
    type: "enum",
    enum: PaymentMethod,
    name: "payment_method",
    nullable: true,
  })
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: "Payment status", enum: PaymentStatus })
  @Column({
    type: "enum",
    enum: PaymentStatus,
    name: "payment_status",
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @ApiProperty({ description: "Payment terms", required: false })
  @Column({ type: "text", name: "payment_terms", nullable: true })
  paymentTerms: string;

  @ApiProperty({ description: "Internal notes", required: false })
  @Column({ type: "text", nullable: true })
  notes?: string;

  @ApiProperty({ description: "Customer notes", required: false })
  @Column({ type: "text", name: "customer_notes", nullable: true })
  customerNotes?: string;

  @ApiProperty({ description: "Created by user ID" })
  @Column({ type: "uuid", name: "created_by", nullable: true })
  createdBy?: string;

  @ApiProperty({ description: "Approved by user ID", required: false })
  @Column({ type: "uuid", name: "approved_by", nullable: true })
  approvedBy?: string;

  @ApiProperty({ description: "Approval timestamp", required: false })
  @Column({ type: "timestamp", name: "approved_at", nullable: true })
  approvedAt?: Date;

  @ApiProperty({ description: "Invoiced timestamp", required: false })
  @Column({ type: "timestamp", name: "invoiced_at", nullable: true })
  invoicedAt: Date;

  @ApiProperty({ description: "Paid timestamp", required: false })
  @Column({ type: "timestamp", name: "paid_at", nullable: true })
  paidAt: Date;

  @ApiProperty({ description: "Creation timestamp" })
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @ApiProperty({ description: "Last update timestamp" })
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @OneToMany(() => SalesItem, (item) => item.sales, { cascade: true })
  items: SalesItem[];
}

@Entity("sales_items")
export class SalesItem {
  @ApiProperty({ description: "Unique identifier" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ description: "Sales ID" })
  @Column({ type: "uuid", name: "sales_id" })
  salesId: string;

  @ApiProperty({ description: "Product ID" })
  @Column({ type: "uuid", name: "product_id", nullable: true })
  productId: string;

  @ApiProperty({ description: "Quantity" })
  @Column({ type: "int" })
  quantity: number;

  @ApiProperty({ description: "Unit price" })
  @Column({ type: "decimal", precision: 10, scale: 2, name: "unit_price" })
  unitPrice: number;

  @ApiProperty({ description: "Discount percentage" })
  @Column({
    type: "decimal",
    precision: 5,
    scale: 2,
    name: "discount_percentage",
    default: 0,
  })
  discountPercentage: number;

  @ApiProperty({ description: "Discount amount" })
  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    name: "discount_amount",
    default: 0,
  })
  discountAmount: number;

  @ApiProperty({ description: "Tax percentage" })
  @Column({
    type: "decimal",
    precision: 5,
    scale: 2,
    name: "tax_percentage",
    default: 0,
  })
  taxPercentage: number;

  @ApiProperty({ description: "Tax amount" })
  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    name: "tax_amount",
    default: 0,
  })
  taxAmount: number;

  @ApiProperty({ description: "Subtotal" })
  @Column({ type: "decimal", precision: 15, scale: 2 })
  subtotal: number;

  @ApiProperty({ description: "Batch number", required: false })
  @Column({
    type: "varchar",
    length: 100,
    name: "batch_number",
    nullable: true,
  })
  batchNumber: string;

  @ApiProperty({ description: "Returned quantity" })
  @Column({ type: "int", name: "returned_quantity", default: 0 })
  returnedQuantity: number;

  @ApiProperty({ description: "Notes", required: false })
  @Column({ type: "text", nullable: true })
  notes: string;

  @ApiProperty({ description: "Creation timestamp" })
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @ManyToOne(() => Sales, (sales) => sales.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "sales_id" })
  sales: Sales;
}
