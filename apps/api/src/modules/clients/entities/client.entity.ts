import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { ClientTransaction } from "./client-transaction.entity";

@Entity("clients")
export class Client {
  @ApiProperty({ description: "Unique identifier" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ description: "Vendor ID" })
  @Column({ type: "uuid", name: "vendor_id" })
  vendorId: string;

  @ApiProperty({ description: "Client name" })
  @Column({ type: "varchar", length: 255 })
  name: string;

  @ApiProperty({ description: "Client email", required: false })
  @Column({ type: "varchar", length: 255, nullable: true })
  email: string;

  @ApiProperty({ description: "Client phone", required: false })
  @Column({ type: "varchar", length: 20, nullable: true })
  phone: string;

  @ApiProperty({ description: "Client address", required: false })
  @Column({ type: "text", nullable: true })
  address: string;

  @ApiProperty({ description: "City" })
  @Column({ type: "varchar", length: 100, nullable: true })
  city: string;

  @ApiProperty({ description: "Country" })
  @Column({ type: "varchar", length: 100, nullable: true, default: "Nigeria" })
  country: string;

  @ApiProperty({ description: "Tax ID", required: false })
  @Column({ type: "varchar", length: 50, name: "tax_id", nullable: true })
  taxId: string;

  @ApiProperty({ description: "Contact person", required: false })
  @Column({
    type: "varchar",
    length: 255,
    name: "contact_person",
    nullable: true,
  })
  contactPerson: string;

  @ApiProperty({ description: "Total balance" })
  @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
  balance: number;

  @ApiProperty({ description: "Is active" })
  @Column({ type: "boolean", default: true, name: "is_active" })
  isActive: boolean;

  @ApiProperty({ description: "Additional notes", required: false })
  @Column({ type: "text", nullable: true })
  notes: string;

  @OneToMany(() => ClientTransaction, (transaction) => transaction.client)
  transactions: ClientTransaction[];

  @ApiProperty({ description: "Creation timestamp" })
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @ApiProperty({ description: "Last update timestamp" })
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
