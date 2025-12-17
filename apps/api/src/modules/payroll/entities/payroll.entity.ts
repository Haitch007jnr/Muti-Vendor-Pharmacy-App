import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

export enum PayrollStatus {
  DRAFT = "draft",
  PENDING = "pending",
  APPROVED = "approved",
  PAID = "paid",
  CANCELLED = "cancelled",
}

export enum PayrollPeriodType {
  WEEKLY = "weekly",
  BI_WEEKLY = "bi_weekly",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  YEARLY = "yearly",
}

@Entity("payrolls")
export class Payroll {
  @ApiProperty({ description: "Unique identifier" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ description: "Vendor ID" })
  @Column({ type: "uuid", name: "vendor_id" })
  vendorId: string;

  @ApiProperty({ description: "Payroll reference number" })
  @Column({
    type: "varchar",
    length: 100,
    unique: true,
    name: "payroll_number",
  })
  payrollNumber: string;

  @ApiProperty({ description: "Payroll period type", enum: PayrollPeriodType })
  @Column({ type: "varchar", length: 50, name: "period_type" })
  periodType: PayrollPeriodType;

  @ApiProperty({ description: "Period start date" })
  @Column({ type: "date", name: "period_start" })
  periodStart: Date;

  @ApiProperty({ description: "Period end date" })
  @Column({ type: "date", name: "period_end" })
  periodEnd: Date;

  @ApiProperty({ description: "Payment date" })
  @Column({ type: "date", name: "payment_date" })
  paymentDate: Date;

  @ApiProperty({ description: "Total gross amount" })
  @Column({ type: "decimal", precision: 15, scale: 2, name: "total_gross" })
  totalGross: number;

  @ApiProperty({ description: "Total deductions" })
  @Column({
    type: "decimal",
    precision: 15,
    scale: 2,
    name: "total_deductions",
    default: 0,
  })
  totalDeductions: number;

  @ApiProperty({ description: "Total net amount" })
  @Column({ type: "decimal", precision: 15, scale: 2, name: "total_net" })
  totalNet: number;

  @ApiProperty({ description: "Payroll status", enum: PayrollStatus })
  @Column({ type: "varchar", length: 50, default: PayrollStatus.DRAFT })
  status: PayrollStatus;

  @ApiProperty({ description: "Created by user ID" })
  @Column({ type: "uuid", name: "created_by" })
  createdBy: string;

  @ApiProperty({ description: "Approved by user ID", required: false })
  @Column({ type: "uuid", name: "approved_by", nullable: true })
  approvedBy: string;

  @ApiProperty({ description: "Approval timestamp", required: false })
  @Column({ type: "timestamp", name: "approved_at", nullable: true })
  approvedAt: Date;

  @ApiProperty({ description: "Paid timestamp", required: false })
  @Column({ type: "timestamp", name: "paid_at", nullable: true })
  paidAt: Date;

  @ApiProperty({ description: "Notes", required: false })
  @Column({ type: "text", nullable: true })
  notes: string;

  @ApiProperty({ description: "Creation timestamp" })
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @ApiProperty({ description: "Last update timestamp" })
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @OneToMany(() => Payslip, (payslip) => payslip.payroll, { cascade: true })
  payslips: Payslip[];
}

export enum PayslipStatus {
  DRAFT = "draft",
  GENERATED = "generated",
  SENT = "sent",
  PAID = "paid",
}

@Entity("payslips")
export class Payslip {
  @ApiProperty({ description: "Unique identifier" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ description: "Payroll ID" })
  @Column({ type: "uuid", name: "payroll_id" })
  payrollId: string;

  @ApiProperty({ description: "Employee ID" })
  @Column({ type: "uuid", name: "employee_id" })
  employeeId: string;

  @ApiProperty({ description: "Basic salary" })
  @Column({ type: "decimal", precision: 10, scale: 2, name: "basic_salary" })
  basicSalary: number;

  @ApiProperty({ description: "Allowances", required: false })
  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  allowances: number;

  @ApiProperty({ description: "Bonuses", required: false })
  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  bonuses: number;

  @ApiProperty({ description: "Overtime pay", required: false })
  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  overtime: number;

  @ApiProperty({ description: "Gross salary" })
  @Column({ type: "decimal", precision: 10, scale: 2, name: "gross_salary" })
  grossSalary: number;

  @ApiProperty({ description: "Tax deduction", required: false })
  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  tax: number;

  @ApiProperty({ description: "Pension deduction", required: false })
  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  pension: number;

  @ApiProperty({ description: "Health insurance deduction", required: false })
  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    name: "health_insurance",
    default: 0,
  })
  healthInsurance: number;

  @ApiProperty({ description: "Other deductions", required: false })
  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    name: "other_deductions",
    default: 0,
  })
  otherDeductions: number;

  @ApiProperty({ description: "Total deductions" })
  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    name: "total_deductions",
    default: 0,
  })
  totalDeductions: number;

  @ApiProperty({ description: "Net salary" })
  @Column({ type: "decimal", precision: 10, scale: 2, name: "net_salary" })
  netSalary: number;

  @ApiProperty({ description: "Payment method", required: false })
  @Column({
    type: "varchar",
    length: 50,
    name: "payment_method",
    nullable: true,
  })
  paymentMethod: string;

  @ApiProperty({ description: "Bank account ID", required: false })
  @Column({ type: "uuid", name: "bank_account_id", nullable: true })
  bankAccountId: string;

  @ApiProperty({ description: "Payslip status", enum: PayslipStatus })
  @Column({ type: "varchar", length: 50, default: PayslipStatus.DRAFT })
  status: PayslipStatus;

  @ApiProperty({ description: "PDF URL", required: false })
  @Column({ type: "varchar", length: 500, name: "pdf_url", nullable: true })
  pdfUrl: string;

  @ApiProperty({ description: "Notes", required: false })
  @Column({ type: "text", nullable: true })
  notes: string;

  @ApiProperty({ description: "Creation timestamp" })
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @ManyToOne(() => Payroll, (payroll) => payroll.payslips, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "payroll_id" })
  payroll: Payroll;
}
