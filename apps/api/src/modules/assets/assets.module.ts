import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AssetsController } from "./assets.controller";
import { AssetsService } from "./assets.service";
import { Asset } from "./entities/asset.entity";
import { AssetCategory } from "./entities/asset-category.entity";
import { AssetDepreciation } from "./entities/asset-depreciation.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Asset, AssetCategory, AssetDepreciation]),
  ],
  controllers: [AssetsController],
  providers: [AssetsService],
  exports: [AssetsService],
})
export class AssetsModule {}
