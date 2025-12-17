import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity("vendors")
export class Vendor {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "user_id", type: "uuid", nullable: true })
  userId: string;

  @Column({ name: "business_name", length: 255 })
  businessName: string;

  @Column({ name: "business_email", length: 255, nullable: true })
  businessEmail: string;

  @Column({ name: "business_phone", length: 20, nullable: true })
  businessPhone: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ name: "logo_url", length: 500, nullable: true })
  logoUrl: string;

  @Column({ type: "text", nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  state: string;

  @Column({ length: 100, default: "Nigeria" })
  country: string;

  @Column({ name: "postal_code", length: 20, nullable: true })
  postalCode: string;

  @Column({ name: "tax_id", length: 50, nullable: true })
  taxId: string;

  @Column({ name: "bank_name", length: 100, nullable: true })
  bankName: string;

  @Column({ name: "bank_account_number", length: 50, nullable: true })
  bankAccountNumber: string;

  @Column({ name: "bank_account_name", length: 255, nullable: true })
  bankAccountName: string;

  @Column({ name: "is_verified", default: false })
  isVerified: boolean;

  @Column({ name: "is_active", default: true })
  isActive: boolean;

  @Column({ type: "decimal", precision: 2, scale: 1, default: 0 })
  rating: number;

  @Column({
    name: "total_sales",
    type: "decimal",
    precision: 15,
    scale: 2,
    default: 0,
  })
  totalSales: number;

  @Column({
    name: "commission_rate",
    type: "decimal",
    precision: 5,
    scale: 2,
    default: 10.0,
  })
  commissionRate: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
