import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Loan } from "./loan.entity";

@Entity("loan_authorities")
export class LoanAuthority {
  @ApiProperty({ description: "Unique identifier" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ description: "Vendor ID" })
  @Column({ type: "uuid", name: "vendor_id" })
  vendorId: string;

  @ApiProperty({ description: "Authority name (bank, microfinance, etc.)" })
  @Column({ type: "varchar", length: 255, name: "authority_name" })
  authorityName: string;

  @ApiProperty({ description: "Contact person name", required: false })
  @Column({ type: "varchar", length: 255, name: "contact_person", nullable: true })
  contactPerson: string;

  @ApiProperty({ description: "Contact email", required: false })
  @Column({ type: "varchar", length: 255, name: "contact_email", nullable: true })
  contactEmail: string;

  @ApiProperty({ description: "Contact phone", required: false })
  @Column({ type: "varchar", length: 20, name: "contact_phone", nullable: true })
  contactPhone: string;

  @ApiProperty({ description: "Address", required: false })
  @Column({ type: "text", nullable: true })
  address: string;

  @ApiProperty({ description: "Is authority active" })
  @Column({ type: "boolean", default: true, name: "is_active" })
  isActive: boolean;

  @ApiProperty({ description: "Additional notes", required: false })
  @Column({ type: "text", nullable: true })
  notes: string;

  @ApiProperty({ description: "Creation timestamp" })
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @ApiProperty({ description: "Last update timestamp" })
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @OneToMany(() => Loan, (loan) => loan.authority)
  loans: Loan[];
}
