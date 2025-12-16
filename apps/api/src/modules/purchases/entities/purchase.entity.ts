import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum PurchaseStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
  WALLET = 'wallet',
}

@Entity('purchases')
export class Purchase {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Purchase number' })
  @Column({ type: 'varchar', length: 50, unique: true, name: 'purchase_number' })
  purchaseNumber: string;

  @ApiProperty({ description: 'Vendor ID' })
  @Column({ type: 'uuid', name: 'vendor_id' })
  vendorId: string;

  @ApiProperty({ description: 'Supplier ID', required: false })
  @Column({ type: 'uuid', name: 'supplier_id', nullable: true })
  supplierId: string;

  @ApiProperty({ description: 'Purchase status', enum: PurchaseStatus })
  @Column({ type: 'enum', enum: PurchaseStatus, default: PurchaseStatus.DRAFT })
  status: PurchaseStatus;

  @ApiProperty({ description: 'Purchase date' })
  @Column({ type: 'date', name: 'purchase_date' })
  purchaseDate: Date;

  @ApiProperty({ description: 'Expected delivery date', required: false })
  @Column({ type: 'date', name: 'expected_delivery_date', nullable: true })
  expectedDeliveryDate: Date;

  @ApiProperty({ description: 'Actual delivery date', required: false })
  @Column({ type: 'date', name: 'actual_delivery_date', nullable: true })
  actualDeliveryDate: Date;

  @ApiProperty({ description: 'Subtotal amount' })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  subtotal: number;

  @ApiProperty({ description: 'Discount amount' })
  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'discount_amount', default: 0 })
  discountAmount: number;

  @ApiProperty({ description: 'Tax amount' })
  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'tax_amount', default: 0 })
  taxAmount: number;

  @ApiProperty({ description: 'Shipping cost' })
  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'shipping_cost', default: 0 })
  shippingCost: number;

  @ApiProperty({ description: 'Total amount' })
  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'total_amount' })
  totalAmount: number;

  @ApiProperty({ description: 'Payment method', enum: PaymentMethod, required: false })
  @Column({ type: 'enum', enum: PaymentMethod, name: 'payment_method', nullable: true })
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'Payment status', enum: PaymentStatus })
  @Column({ type: 'enum', enum: PaymentStatus, name: 'payment_status', default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @ApiProperty({ description: 'Payment terms', required: false })
  @Column({ type: 'text', name: 'payment_terms', nullable: true })
  paymentTerms: string;

  @ApiProperty({ description: 'Notes', required: false })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ description: 'Created by user ID' })
  @Column({ type: 'uuid', name: 'created_by', nullable: true })
  createdBy: string;

  @ApiProperty({ description: 'Approved by user ID', required: false })
  @Column({ type: 'uuid', name: 'approved_by', nullable: true })
  approvedBy: string;

  @ApiProperty({ description: 'Approval timestamp', required: false })
  @Column({ type: 'timestamp', name: 'approved_at', nullable: true })
  approvedAt: Date;

  @ApiProperty({ description: 'Received by user ID', required: false })
  @Column({ type: 'uuid', name: 'received_by', nullable: true })
  receivedBy: string;

  @ApiProperty({ description: 'Received timestamp', required: false })
  @Column({ type: 'timestamp', name: 'received_at', nullable: true })
  receivedAt: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => PurchaseItem, (item) => item.purchase, { cascade: true })
  items: PurchaseItem[];
}

@Entity('purchase_items')
export class PurchaseItem {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Purchase ID' })
  @Column({ type: 'uuid', name: 'purchase_id' })
  purchaseId: string;

  @ApiProperty({ description: 'Product ID' })
  @Column({ type: 'uuid', name: 'product_id', nullable: true })
  productId: string;

  @ApiProperty({ description: 'Quantity ordered' })
  @Column({ type: 'int' })
  quantity: number;

  @ApiProperty({ description: 'Unit cost' })
  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'unit_cost' })
  unitCost: number;

  @ApiProperty({ description: 'Discount percentage' })
  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'discount_percentage', default: 0 })
  discountPercentage: number;

  @ApiProperty({ description: 'Discount amount' })
  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'discount_amount', default: 0 })
  discountAmount: number;

  @ApiProperty({ description: 'Tax percentage' })
  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'tax_percentage', default: 0 })
  taxPercentage: number;

  @ApiProperty({ description: 'Tax amount' })
  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'tax_amount', default: 0 })
  taxAmount: number;

  @ApiProperty({ description: 'Subtotal' })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  subtotal: number;

  @ApiProperty({ description: 'Batch number', required: false })
  @Column({ type: 'varchar', length: 100, name: 'batch_number', nullable: true })
  batchNumber: string;

  @ApiProperty({ description: 'Expiry date', required: false })
  @Column({ type: 'date', name: 'expiry_date', nullable: true })
  expiryDate: Date;

  @ApiProperty({ description: 'Received quantity' })
  @Column({ type: 'int', name: 'received_quantity', default: 0 })
  receivedQuantity: number;

  @ApiProperty({ description: 'Notes', required: false })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Purchase, (purchase) => purchase.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchase_id' })
  purchase: Purchase;
}
