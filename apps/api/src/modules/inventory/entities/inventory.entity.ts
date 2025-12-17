import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

@Entity("inventory")
@Index(["productId", "vendorId"], { unique: true })
export class Inventory {
  @ApiProperty({ description: "Unique identifier" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ description: "Product ID" })
  @Column({ type: "uuid", name: "product_id" })
  productId: string;

  @ApiProperty({ description: "Vendor ID" })
  @Column({ type: "uuid", name: "vendor_id" })
  vendorId: string;

  @ApiProperty({ description: "Quantity available" })
  @Column({ type: "int", name: "quantity_available", default: 0 })
  quantityAvailable: number;

  @ApiProperty({ description: "Quantity reserved" })
  @Column({ type: "int", name: "quantity_reserved", default: 0 })
  quantityReserved: number;

  @ApiProperty({
    description: "Reorder level - alerts when stock reaches this level",
  })
  @Column({ type: "int", name: "reorder_level", default: 10 })
  reorderLevel: number;

  @ApiProperty({
    description: "Reorder quantity - suggested quantity to reorder",
  })
  @Column({ type: "int", name: "reorder_quantity", default: 50 })
  reorderQuantity: number;

  @ApiProperty({ description: "Batch number", required: false })
  @Column({
    type: "varchar",
    length: 100,
    name: "batch_number",
    nullable: true,
  })
  batchNumber: string;

  @ApiProperty({ description: "Expiry date", required: false })
  @Column({ type: "date", name: "expiry_date", nullable: true })
  expiryDate: Date;

  @ApiProperty({ description: "Last restocked timestamp", required: false })
  @Column({ type: "timestamp", name: "last_restocked", nullable: true })
  lastRestocked: Date;

  @ApiProperty({ description: "Creation timestamp" })
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @ApiProperty({ description: "Last update timestamp" })
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}

export enum InventoryAdjustmentType {
  INCREASE = "increase",
  DECREASE = "decrease",
  CORRECTION = "correction",
  DAMAGE = "damage",
  EXPIRED = "expired",
  RETURN = "return",
}

export enum InventoryAdjustmentStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

@Entity("inventory_adjustments")
export class InventoryAdjustment {
  @ApiProperty({ description: "Unique identifier" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ description: "Inventory ID" })
  @Column({ type: "uuid", name: "inventory_id" })
  inventoryId: string;

  @ApiProperty({
    description: "Adjustment type",
    enum: InventoryAdjustmentType,
  })
  @Column({ type: "varchar", length: 50, name: "adjustment_type" })
  adjustmentType: InventoryAdjustmentType;

  @ApiProperty({ description: "Quantity adjusted" })
  @Column({ type: "int" })
  quantity: number;

  @ApiProperty({ description: "Quantity before adjustment" })
  @Column({ type: "int", name: "quantity_before" })
  quantityBefore: number;

  @ApiProperty({ description: "Quantity after adjustment" })
  @Column({ type: "int", name: "quantity_after" })
  quantityAfter: number;

  @ApiProperty({ description: "Reason for adjustment" })
  @Column({ type: "text" })
  reason: string;

  @ApiProperty({ description: "Reference number", required: false })
  @Column({ type: "varchar", length: 100, nullable: true })
  reference: string;

  @ApiProperty({
    description: "Adjustment status",
    enum: InventoryAdjustmentStatus,
  })
  @Column({
    type: "varchar",
    length: 50,
    default: InventoryAdjustmentStatus.APPROVED,
  })
  status: InventoryAdjustmentStatus;

  @ApiProperty({ description: "Created by user ID" })
  @Column({ type: "uuid", name: "created_by" })
  createdBy: string;

  @ApiProperty({ description: "Approved by user ID", required: false })
  @Column({ type: "uuid", name: "approved_by", nullable: true })
  approvedBy: string;

  @ApiProperty({ description: "Approved at timestamp", required: false })
  @Column({ type: "timestamp", name: "approved_at", nullable: true })
  approvedAt: Date;

  @ApiProperty({ description: "Notes", required: false })
  @Column({ type: "text", nullable: true })
  notes: string;

  @ApiProperty({ description: "Creation timestamp" })
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @ManyToOne(() => Inventory)
  @JoinColumn({ name: "inventory_id" })
  inventory: Inventory;
}
