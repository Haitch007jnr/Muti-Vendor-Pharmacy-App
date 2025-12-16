import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Client } from './client.entity';

export enum TransactionType {
  DEBIT = 'debit',
  CREDIT = 'credit',
}

@Entity('client_transactions')
export class ClientTransaction {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Client ID' })
  @Column({ type: 'uuid', name: 'client_id' })
  clientId: string;

  @ManyToOne(() => Client, (client) => client.transactions)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @ApiProperty({ description: 'Transaction type', enum: TransactionType })
  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @ApiProperty({ description: 'Transaction amount' })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @ApiProperty({ description: 'Balance after transaction' })
  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'balance_after' })
  balanceAfter: number;

  @ApiProperty({ description: 'Transaction description' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Transaction reference', required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  reference: string;

  @ApiProperty({ description: 'Created by user ID' })
  @Column({ type: 'uuid', name: 'created_by' })
  createdBy: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
