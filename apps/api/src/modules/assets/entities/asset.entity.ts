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
import { AssetCategory } from "./asset-category.entity";
import { AssetDepreciation } from "./asset-depreciation.entity";

export enum AssetStatus {
  ACTIVE = "active",
  UNDER_MAINTENANCE = "under_maintenance",
  DISPOSED = "disposed",
  SOLD = "sold",
  WRITTEN_OFF = "written_off",
}

export enum DepreciationMethod {
  STRAIGHT_LINE = "straight_line",
  DECLINING_BALANCE = "declining_balance",
  DOUBLE_DECLINING_BALANCE = "double_declining_balance",
  UNITS_OF_PRODUCTION = "units_of_production",
}

@Entity("assets")
export class Asset {
  @ApiProperty({ description: "Unique identifier" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ description: "Vendor ID" })
  @Column({ type: "uuid", name: "vendor_id" })
  vendorId: string;

  @ApiProperty({ description: "Asset category ID" })
  @Column({ type: "uuid", name: "category_id" })
  categoryId: string;

  @ApiProperty({ description: "Asset name" })
  @Column({ type: "varchar", length: 255, name: "asset_name" })
  assetName: string;

  @ApiProperty({ description: "Asset tag/identifier" })
  @Column({ type: "varchar", length: 100, name: "asset_tag", unique: true })
  assetTag: string;

  @ApiProperty({ description: "Asset description", required: false })
  @Column({ type: "text", nullable: true })
  description: string;

  @ApiProperty({ description: "Purchase date" })
  @Column({ type: "date", name: "purchase_date" })
  purchaseDate: Date;

  @ApiProperty({ description: "Purchase cost" })
  @Column({ type: "decimal", precision: 15, scale: 2, name: "purchase_cost" })
  purchaseCost: number;

  @ApiProperty({ description: "Current value" })
  @Column({ type: "decimal", precision: 15, scale: 2, name: "current_value" })
  currentValue: number;

  @ApiProperty({ description: "Salvage value (residual value)" })
  @Column({
    type: "decimal",
    precision: 15,
    scale: 2,
    name: "salvage_value",
    default: 0,
  })
  salvageValue: number;

  @ApiProperty({ description: "Useful life in years" })
  @Column({ type: "integer", name: "useful_life" })
  usefulLife: number;

  @ApiProperty({ description: "Depreciation method", enum: DepreciationMethod })
  @Column({
    type: "varchar",
    length: 50,
    name: "depreciation_method",
    default: DepreciationMethod.STRAIGHT_LINE,
  })
  depreciationMethod: DepreciationMethod;

  @ApiProperty({ description: "Annual depreciation rate (percentage)" })
  @Column({
    type: "decimal",
    precision: 5,
    scale: 2,
    name: "depreciation_rate",
    default: 0,
  })
  depreciationRate: number;

  @ApiProperty({ description: "Accumulated depreciation" })
  @Column({
    type: "decimal",
    precision: 15,
    scale: 2,
    name: "accumulated_depreciation",
    default: 0,
  })
  accumulatedDepreciation: number;

  @ApiProperty({ description: "Asset status", enum: AssetStatus })
  @Column({ type: "varchar", length: 50, default: AssetStatus.ACTIVE })
  status: AssetStatus;

  @ApiProperty({ description: "Location of the asset", required: false })
  @Column({ type: "varchar", length: 255, nullable: true })
  location: string;

  @ApiProperty({ description: "Assigned to (employee ID)", required: false })
  @Column({ type: "uuid", name: "assigned_to", nullable: true })
  assignedTo: string;

  @ApiProperty({ description: "Serial number", required: false })
  @Column({
    type: "varchar",
    length: 100,
    name: "serial_number",
    nullable: true,
  })
  serialNumber: string;

  @ApiProperty({ description: "Manufacturer", required: false })
  @Column({ type: "varchar", length: 255, nullable: true })
  manufacturer: string;

  @ApiProperty({ description: "Model", required: false })
  @Column({ type: "varchar", length: 255, nullable: true })
  model: string;

  @ApiProperty({ description: "Warranty expiry date", required: false })
  @Column({ type: "date", name: "warranty_expiry", nullable: true })
  warrantyExpiry: Date;

  @ApiProperty({ description: "Last maintenance date", required: false })
  @Column({ type: "date", name: "last_maintenance_date", nullable: true })
  lastMaintenanceDate: Date;

  @ApiProperty({ description: "Next maintenance date", required: false })
  @Column({ type: "date", name: "next_maintenance_date", nullable: true })
  nextMaintenanceDate: Date;

  @ApiProperty({ description: "Additional notes", required: false })
  @Column({ type: "text", nullable: true })
  notes: string;

  @ApiProperty({ description: "Creation timestamp" })
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @ApiProperty({ description: "Last update timestamp" })
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @ManyToOne(() => AssetCategory, (category) => category.assets, {
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "category_id" })
  category: AssetCategory;

  @OneToMany(() => AssetDepreciation, (depreciation) => depreciation.asset)
  depreciations: AssetDepreciation[];
}
