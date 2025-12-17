import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { RolePermission } from "./role-permission.entity";
import { UserRole } from "./user-role.entity";
import { Vendor } from "./vendor.entity";

@Entity("roles")
export class Role {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true, length: 50 })
  name: string;

  @Column({ name: "display_name", length: 100 })
  displayName: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ name: "is_system", default: false })
  isSystem: boolean;

  @Column({ name: "vendor_id", type: "uuid", nullable: true })
  vendorId: string;

  @ManyToOne(() => Vendor, { nullable: true })
  @JoinColumn({ name: "vendor_id" })
  vendor: Vendor;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions: RolePermission[];

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles: UserRole[];
}
