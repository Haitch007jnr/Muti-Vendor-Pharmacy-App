import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Loan } from "./loan.entity";

export enum PaymentType {
  PRINCIPAL = "principal",
  INTEREST = "interest",
  MIXED = "mixed",
  PENALTY = "penalty",
}

@Entity("loan_payments")
export class LoanPayment {
  @ApiProperty({ description: "Unique identifier" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ description: "Loan ID" })
  @Column({ type: "uuid", name: "loan_id" })
  loanId: string;

  @ApiProperty({ description: "Payment amount" })
  @Column({ type: "decimal", precision: 15, scale: 2 })
  amount: number;

  @ApiProperty({ description: "Payment type", enum: PaymentType })
  @Column({ type: "varchar", length: 50, name: "payment_type" })
  paymentType: PaymentType;

  @ApiProperty({ description: "Principal amount in this payment" })
  @Column({
    type: "decimal",
    precision: 15,
    scale: 2,
    name: "principal_amount",
    default: 0,
  })
  principalAmount: number;

  @ApiProperty({ description: "Interest amount in this payment" })
  @Column({
    type: "decimal",
    precision: 15,
    scale: 2,
    name: "interest_amount",
    default: 0,
  })
  interestAmount: number;

  @ApiProperty({ description: "Balance after payment" })
  @Column({ type: "decimal", precision: 15, scale: 2, name: "balance_after" })
  balanceAfter: number;

  @ApiProperty({ description: "Payment date" })
  @Column({ type: "date", name: "payment_date" })
  paymentDate: Date;

  @ApiProperty({
    description: "Transaction ID from accounting",
    required: false,
  })
  @Column({ type: "uuid", name: "transaction_id", nullable: true })
  transactionId: string;

  @ApiProperty({ description: "Payment reference", required: false })
  @Column({ type: "varchar", length: 255, nullable: true })
  reference: string;

  @ApiProperty({ description: "Additional notes", required: false })
  @Column({ type: "text", nullable: true })
  notes: string;

  @ApiProperty({ description: "Creation timestamp" })
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @ManyToOne(() => Loan, (loan) => loan.payments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "loan_id" })
  loan: Loan;
}
