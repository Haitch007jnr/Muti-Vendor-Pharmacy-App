import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum UpdateStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
  ROLLED_BACK = "rolled_back",
}

export enum UpdateType {
  PATCH = "patch",
  MINOR = "minor",
  MAJOR = "major",
  HOTFIX = "hotfix",
}

@Entity("updates")
export class Update {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 50, unique: true })
  version: string;

  @Column({ type: "enum", enum: UpdateType })
  type: UpdateType;

  @Column({ type: "varchar", length: 255 })
  title: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "text", nullable: true })
  changelog: string;

  @Column({ type: "enum", enum: UpdateStatus, default: UpdateStatus.PENDING })
  status: UpdateStatus;

  @Column({ type: "timestamp", nullable: true })
  appliedAt: Date;

  @Column({ type: "varchar", length: 255, nullable: true })
  appliedBy: string;

  @Column({ type: "json", nullable: true })
  metadata: Record<string, any>;

  @Column({ type: "text", nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
