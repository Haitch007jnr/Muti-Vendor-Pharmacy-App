import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Department } from "../../departments/entities/department.entity";

@Entity("employees")
export class Employee {
  @ApiProperty({ description: "Unique identifier" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ description: "User ID" })
  @Column({ type: "uuid", name: "user_id" })
  userId: string;

  @ApiProperty({ description: "Vendor ID" })
  @Column({ type: "uuid", name: "vendor_id" })
  vendorId: string;

  @ApiProperty({ description: "Department ID", required: false })
  @Column({ type: "uuid", name: "department_id", nullable: true })
  departmentId: string;

  @ManyToOne(() => Department)
  @JoinColumn({ name: "department_id" })
  department: Department;

  @ApiProperty({ description: "Employee number", required: false })
  @Column({
    type: "varchar",
    length: 50,
    name: "employee_number",
    nullable: true,
    unique: true,
  })
  employeeNumber: string;

  @ApiProperty({ description: "Position/Job title", required: false })
  @Column({ type: "varchar", length: 100, nullable: true })
  position: string;

  @ApiProperty({ description: "Salary", required: false })
  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  salary: number;

  @ApiProperty({ description: "Hire date", required: false })
  @Column({ type: "date", name: "hire_date", nullable: true })
  hireDate: Date;

  @ApiProperty({ description: "Termination date", required: false })
  @Column({ type: "date", name: "termination_date", nullable: true })
  terminationDate: Date;

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
