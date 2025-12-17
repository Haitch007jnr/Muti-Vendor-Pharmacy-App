import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { LoanAuthority } from "./loan-authority.entity";
import { LoanPayment } from "./loan-payment.entity";

export enum LoanType {
  TERM_LOAN = "term_loan",
  CREDIT_CARD = "credit_card",
  LINE_OF_CREDIT = "line_of_credit",
  OVERDRAFT = "overdraft",
  OTHER = "other",
}

export enum LoanStatus {
  ACTIVE = "active",
  PAID = "paid",
  DEFAULTED = "defaulted",
  RESTRUCTURED = "restructured",
}

@Entity("loans")
export class Loan {
  @ApiProperty({ description: "Unique identifier" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ description: "Vendor ID" })
  @Column({ type: "uuid", name: "vendor_id" })
  vendorId: string;

  @ApiProperty({ description: "Loan authority ID" })
  @Column({ type: "uuid", name: "authority_id" })
  authorityId: string;

  @ApiProperty({ description: "Loan reference number" })
  @Column({
    type: "varchar",
    length: 100,
    name: "reference_number",
    unique: true,
  })
  referenceNumber: string;

  @ApiProperty({ description: "Loan type", enum: LoanType })
  @Column({ type: "varchar", length: 50, name: "loan_type" })
  loanType: LoanType;

  @ApiProperty({ description: "Loan principal amount" })
  @Column({
    type: "decimal",
    precision: 15,
    scale: 2,
    name: "principal_amount",
  })
  principalAmount: number;

  @ApiProperty({ description: "Interest rate (percentage)" })
  @Column({ type: "decimal", precision: 5, scale: 2, name: "interest_rate" })
  interestRate: number;

  @ApiProperty({ description: "Total interest amount" })
  @Column({
    type: "decimal",
    precision: 15,
    scale: 2,
    name: "interest_amount",
    default: 0,
  })
  interestAmount: number;

  @ApiProperty({ description: "Total loan amount (principal + interest)" })
  @Column({ type: "decimal", precision: 15, scale: 2, name: "total_amount" })
  totalAmount: number;

  @ApiProperty({ description: "Amount paid so far" })
  @Column({
    type: "decimal",
    precision: 15,
    scale: 2,
    name: "amount_paid",
    default: 0,
  })
  amountPaid: number;

  @ApiProperty({ description: "Outstanding balance" })
  @Column({
    type: "decimal",
    precision: 15,
    scale: 2,
    name: "balance",
    default: 0,
  })
  balance: number;

  @ApiProperty({ description: "Loan tenure in months" })
  @Column({ type: "integer", name: "tenure_months" })
  tenureMonths: number;

  @ApiProperty({ description: "Monthly payment amount" })
  @Column({
    type: "decimal",
    precision: 15,
    scale: 2,
    name: "monthly_payment",
    default: 0,
  })
  monthlyPayment: number;

  @ApiProperty({ description: "Loan start date" })
  @Column({ type: "date", name: "start_date" })
  startDate: Date;

  @ApiProperty({ description: "Loan end date" })
  @Column({ type: "date", name: "end_date" })
  endDate: Date;

  @ApiProperty({ description: "Loan status", enum: LoanStatus })
  @Column({ type: "varchar", length: 50, default: LoanStatus.ACTIVE })
  status: LoanStatus;

  @ApiProperty({
    description: "Account ID for loan transactions",
    required: false,
  })
  @Column({ type: "uuid", name: "account_id", nullable: true })
  accountId: string;

  @ApiProperty({ description: "Loan purpose", required: false })
  @Column({ type: "text", nullable: true })
  purpose: string;

  @ApiProperty({ description: "Additional notes", required: false })
  @Column({ type: "text", nullable: true })
  notes: string;

  @ApiProperty({ description: "Creation timestamp" })
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @ApiProperty({ description: "Last update timestamp" })
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @ManyToOne(() => LoanAuthority, (authority) => authority.loans, {
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "authority_id" })
  authority: LoanAuthority;

  @OneToMany(() => LoanPayment, (payment) => payment.loan)
  payments: LoanPayment[];
}
