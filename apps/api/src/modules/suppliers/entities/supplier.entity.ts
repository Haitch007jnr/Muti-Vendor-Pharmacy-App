import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  swiftCode?: string;
  routingNumber?: string;
}

@Entity("suppliers")
export class Supplier {
  @ApiProperty({ description: "Unique identifier" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ description: "Vendor ID" })
  @Column({ type: "uuid", name: "vendor_id" })
  vendorId: string;

  @ApiProperty({ description: "Supplier name" })
  @Column({ type: "varchar", length: 255 })
  name: string;

  @ApiProperty({ description: "Supplier email", required: false })
  @Column({ type: "varchar", length: 255, nullable: true })
  email: string;

  @ApiProperty({ description: "Supplier phone", required: false })
  @Column({ type: "varchar", length: 20, nullable: true })
  phone: string;

  @ApiProperty({ description: "Supplier address", required: false })
  @Column({ type: "text", nullable: true })
  address: string;

  @ApiProperty({ description: "City" })
  @Column({ type: "varchar", length: 100, nullable: true })
  city: string;

  @ApiProperty({ description: "Country" })
  @Column({ type: "varchar", length: 100, nullable: true })
  country: string;

  @ApiProperty({ description: "Tax ID", required: false })
  @Column({ type: "varchar", length: 50, name: "tax_id", nullable: true })
  taxId: string;

  @ApiProperty({ description: "Bank details", required: false })
  @Column({ type: "jsonb", name: "bank_details", nullable: true })
  bankDetails: BankDetails;

  @ApiProperty({ description: "Contact person", required: false })
  @Column({
    type: "varchar",
    length: 255,
    name: "contact_person",
    nullable: true,
  })
  contactPerson: string;

  @ApiProperty({ description: "Is active" })
  @Column({ type: "boolean", default: true, name: "is_active" })
  isActive: boolean;

  @ApiProperty({ description: "Creation timestamp" })
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @ApiProperty({ description: "Last update timestamp" })
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
