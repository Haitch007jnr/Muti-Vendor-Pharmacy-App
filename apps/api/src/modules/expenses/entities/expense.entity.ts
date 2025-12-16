import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('expenses')
export class Expense {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Vendor ID' })
  @Column({ type: 'uuid', name: 'vendor_id' })
  vendorId: string;

  @ApiProperty({ description: 'Expense category' })
  @Column({ type: 'varchar', length: 100 })
  category: string;

  @ApiProperty({ description: 'Expense subcategory', required: false })
  @Column({ type: 'varchar', length: 100, nullable: true })
  subcategory: string;

  @ApiProperty({ description: 'Expense description', required: false })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Expense amount' })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @ApiProperty({ description: 'Expense date' })
  @Column({ type: 'date' })
  date: Date;

  @ApiProperty({ description: 'Payment method', required: false })
  @Column({ type: 'varchar', length: 50, name: 'payment_method', nullable: true })
  paymentMethod: string;

  @ApiProperty({ description: 'Receipt URL', required: false })
  @Column({ type: 'varchar', length: 500, name: 'receipt_url', nullable: true })
  receiptUrl: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ description: 'User ID who created this expense' })
  @Column({ type: 'uuid', name: 'created_by', nullable: true })
  createdBy: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
