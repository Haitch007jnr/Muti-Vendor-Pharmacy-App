import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Asset } from "./asset.entity";

@Entity("asset_categories")
export class AssetCategory {
  @ApiProperty({ description: "Unique identifier" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ description: "Vendor ID" })
  @Column({ type: "uuid", name: "vendor_id" })
  vendorId: string;

  @ApiProperty({ description: "Category name" })
  @Column({ type: "varchar", length: 255, name: "category_name" })
  categoryName: string;

  @ApiProperty({ description: "Category description", required: false })
  @Column({ type: "text", nullable: true })
  description: string;

  @ApiProperty({ description: "Default depreciation rate (percentage per year)" })
  @Column({
    type: "decimal",
    precision: 5,
    scale: 2,
    name: "default_depreciation_rate",
    default: 10.0,
  })
  defaultDepreciationRate: number;

  @ApiProperty({ description: "Default useful life in years" })
  @Column({ type: "integer", name: "default_useful_life", default: 5 })
  defaultUsefulLife: number;

  @ApiProperty({ description: "Is category active" })
  @Column({ type: "boolean", default: true, name: "is_active" })
  isActive: boolean;

  @ApiProperty({ description: "Creation timestamp" })
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @ApiProperty({ description: "Last update timestamp" })
  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @OneToMany(() => Asset, (asset) => asset.category)
  assets: Asset[];
}
