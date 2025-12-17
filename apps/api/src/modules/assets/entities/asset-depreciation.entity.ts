import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Asset } from "./asset.entity";

@Entity("asset_depreciations")
export class AssetDepreciation {
  @ApiProperty({ description: "Unique identifier" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ description: "Asset ID" })
  @Column({ type: "uuid", name: "asset_id" })
  assetId: string;

  @ApiProperty({ description: "Depreciation year" })
  @Column({ type: "integer" })
  year: number;

  @ApiProperty({ description: "Depreciation month (1-12)" })
  @Column({ type: "integer" })
  month: number;

  @ApiProperty({ description: "Depreciation period (YYYY-MM)" })
  @Column({ type: "varchar", length: 7 })
  period: string;

  @ApiProperty({ description: "Opening value for the period" })
  @Column({ type: "decimal", precision: 15, scale: 2, name: "opening_value" })
  openingValue: number;

  @ApiProperty({ description: "Depreciation amount for the period" })
  @Column({
    type: "decimal",
    precision: 15,
    scale: 2,
    name: "depreciation_amount",
  })
  depreciationAmount: number;

  @ApiProperty({ description: "Closing value for the period" })
  @Column({ type: "decimal", precision: 15, scale: 2, name: "closing_value" })
  closingValue: number;

  @ApiProperty({ description: "Accumulated depreciation at end of period" })
  @Column({
    type: "decimal",
    precision: 15,
    scale: 2,
    name: "accumulated_depreciation",
  })
  accumulatedDepreciation: number;

  @ApiProperty({ description: "Additional notes", required: false })
  @Column({ type: "text", nullable: true })
  notes: string;

  @ApiProperty({ description: "Creation timestamp" })
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @ManyToOne(() => Asset, (asset) => asset.depreciations, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "asset_id" })
  asset: Asset;
}
