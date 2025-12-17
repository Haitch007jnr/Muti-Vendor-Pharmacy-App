import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InventoryController } from "./inventory.controller";
import { InventoryService } from "./inventory.service";
import { Inventory, InventoryAdjustment } from "./entities/inventory.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Inventory, InventoryAdjustment])],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
