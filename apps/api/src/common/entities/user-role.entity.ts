import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { User } from "./user.entity";
import { Role } from "./role.entity";
import { Vendor } from "./vendor.entity";

@Entity("user_roles")
@Unique(["userId", "roleId", "vendorId"])
export class UserRole {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "user_id", type: "uuid" })
  userId: string;

  @Column({ name: "role_id", type: "uuid" })
  roleId: string;

  @Column({ name: "vendor_id", type: "uuid", nullable: true })
  vendorId: string;

  @Column({ name: "assigned_by", type: "uuid", nullable: true })
  assignedBy: string;

  @Column({ name: "expires_at", type: "timestamp", nullable: true })
  expiresAt: Date;

  @ManyToOne(() => User, (user) => user.userRoles, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Role, (role) => role.userRoles, { onDelete: "CASCADE" })
  @JoinColumn({ name: "role_id" })
  role: Role;

  @ManyToOne(() => Vendor, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "vendor_id" })
  vendor: Vendor;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "assigned_by" })
  assigner: User;

  @CreateDateColumn({ name: "assigned_at" })
  assignedAt: Date;
}
