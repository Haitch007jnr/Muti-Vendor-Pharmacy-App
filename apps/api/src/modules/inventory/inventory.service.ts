import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Repository,
  LessThan,
} from "typeorm";
import {
  Inventory,
  InventoryAdjustment,
  InventoryAdjustmentType,
  InventoryAdjustmentStatus,
} from "./entities/inventory.entity";
import { CreateInventoryDto } from "./dto/create-inventory.dto";
import { UpdateInventoryDto } from "./dto/update-inventory.dto";
import { CreateAdjustmentDto } from "./dto/create-adjustment.dto";
import { QueryInventoryDto } from "./dto/query-inventory.dto";

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(InventoryAdjustment)
    private readonly adjustmentRepository: Repository<InventoryAdjustment>,
  ) {}

  async create(createInventoryDto: CreateInventoryDto): Promise<Inventory> {
    // Check if inventory already exists for this product-vendor combination
    const existing = await this.inventoryRepository.findOne({
      where: {
        productId: createInventoryDto.productId,
        vendorId: createInventoryDto.vendorId,
      },
    });

    if (existing) {
      throw new BadRequestException(
        "Inventory already exists for this product and vendor",
      );
    }

    const inventory = this.inventoryRepository.create(createInventoryDto);

    // Set lastRestocked if initial quantity is provided
    if (
      createInventoryDto.quantityAvailable &&
      createInventoryDto.quantityAvailable > 0
    ) {
      inventory.lastRestocked = new Date();
    }

    return await this.inventoryRepository.save(inventory);
  }

  async findAll(query: QueryInventoryDto): Promise<{
    data: Inventory[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      vendorId,
      productId,
      lowStock,
      expired,
      expiringSoonDays,
      page = 1,
      limit = 20,
    } = query;
    const queryBuilder =
      this.inventoryRepository.createQueryBuilder("inventory");

    if (vendorId) {
      queryBuilder.andWhere("inventory.vendor_id = :vendorId", { vendorId });
    }

    if (productId) {
      queryBuilder.andWhere("inventory.product_id = :productId", { productId });
    }

    if (lowStock) {
      queryBuilder.andWhere(
        "inventory.quantity_available <= inventory.reorder_level",
      );
    }

    if (expired) {
      queryBuilder.andWhere("inventory.expiry_date < :now", {
        now: new Date(),
      });
    }

    if (expiringSoonDays) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + expiringSoonDays);
      queryBuilder.andWhere(
        "inventory.expiry_date BETWEEN :now AND :futureDate",
        {
          now: new Date(),
          futureDate,
        },
      );
    }

    queryBuilder.orderBy("inventory.created_at", "DESC");
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({ where: { id } });

    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }

    return inventory;
  }

  async findByProductAndVendor(
    productId: string,
    vendorId: string,
  ): Promise<Inventory | null> {
    return await this.inventoryRepository.findOne({
      where: { productId, vendorId },
    });
  }

  async update(
    id: string,
    updateInventoryDto: UpdateInventoryDto,
  ): Promise<Inventory> {
    const inventory = await this.findOne(id);
    Object.assign(inventory, updateInventoryDto);
    return await this.inventoryRepository.save(inventory);
  }

  async remove(id: string): Promise<void> {
    const inventory = await this.findOne(id);
    await this.inventoryRepository.remove(inventory);
  }

  async getLowStockItems(vendorId: string): Promise<Inventory[]> {
    return await this.inventoryRepository
      .createQueryBuilder("inventory")
      .where("inventory.vendor_id = :vendorId", { vendorId })
      .andWhere("inventory.quantity_available <= inventory.reorder_level")
      .orderBy("inventory.quantity_available", "ASC")
      .getMany();
  }

  async getExpiredItems(vendorId: string): Promise<Inventory[]> {
    return await this.inventoryRepository.find({
      where: {
        vendorId,
        expiryDate: LessThan(new Date()),
      },
      order: { expiryDate: "ASC" },
    });
  }

  async getExpiringSoonItems(
    vendorId: string,
    days: number = 30,
  ): Promise<Inventory[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return await this.inventoryRepository
      .createQueryBuilder("inventory")
      .where("inventory.vendor_id = :vendorId", { vendorId })
      .andWhere("inventory.expiry_date BETWEEN :now AND :futureDate", {
        now: new Date(),
        futureDate,
      })
      .orderBy("inventory.expiry_date", "ASC")
      .getMany();
  }

  async adjustInventory(
    createAdjustmentDto: CreateAdjustmentDto,
    userId: string,
  ): Promise<InventoryAdjustment> {
    const inventory = await this.findOne(createAdjustmentDto.inventoryId);

    const quantityBefore = inventory.quantityAvailable;
    let quantityAfter = quantityBefore;

    // Calculate quantity after adjustment
    switch (createAdjustmentDto.adjustmentType) {
      case InventoryAdjustmentType.INCREASE:
      case InventoryAdjustmentType.RETURN:
        quantityAfter = quantityBefore + createAdjustmentDto.quantity;
        break;
      case InventoryAdjustmentType.DECREASE:
      case InventoryAdjustmentType.DAMAGE:
      case InventoryAdjustmentType.EXPIRED:
        quantityAfter = quantityBefore - createAdjustmentDto.quantity;
        if (quantityAfter < 0) {
          throw new BadRequestException(
            "Adjustment would result in negative inventory",
          );
        }
        break;
      case InventoryAdjustmentType.CORRECTION:
        quantityAfter = createAdjustmentDto.quantity;
        break;
    }

    // Create adjustment record
    const adjustment = this.adjustmentRepository.create({
      ...createAdjustmentDto,
      quantityBefore,
      quantityAfter,
      createdBy: userId,
      status: InventoryAdjustmentStatus.APPROVED,
      approvedBy: userId,
      approvedAt: new Date(),
    });

    await this.adjustmentRepository.save(adjustment);

    // Update inventory
    inventory.quantityAvailable = quantityAfter;
    if (
      [
        InventoryAdjustmentType.INCREASE,
        InventoryAdjustmentType.RETURN,
      ].includes(createAdjustmentDto.adjustmentType)
    ) {
      inventory.lastRestocked = new Date();
    }
    await this.inventoryRepository.save(inventory);

    return adjustment;
  }

  async getAdjustmentHistory(
    inventoryId: string,
  ): Promise<InventoryAdjustment[]> {
    return await this.adjustmentRepository.find({
      where: { inventoryId },
      order: { createdAt: "DESC" },
    });
  }

  async incrementStock(
    productId: string,
    vendorId: string,
    quantity: number,
  ): Promise<Inventory> {
    const inventory = await this.findByProductAndVendor(productId, vendorId);

    if (!inventory) {
      throw new NotFoundException(
        "Inventory not found for this product and vendor",
      );
    }

    inventory.quantityAvailable += quantity;
    inventory.lastRestocked = new Date();
    return await this.inventoryRepository.save(inventory);
  }

  async decrementStock(
    productId: string,
    vendorId: string,
    quantity: number,
  ): Promise<Inventory> {
    const inventory = await this.findByProductAndVendor(productId, vendorId);

    if (!inventory) {
      throw new NotFoundException(
        "Inventory not found for this product and vendor",
      );
    }

    if (inventory.quantityAvailable < quantity) {
      throw new BadRequestException("Insufficient stock available");
    }

    inventory.quantityAvailable -= quantity;
    return await this.inventoryRepository.save(inventory);
  }

  async reserveStock(
    productId: string,
    vendorId: string,
    quantity: number,
  ): Promise<Inventory> {
    const inventory = await this.findByProductAndVendor(productId, vendorId);

    if (!inventory) {
      throw new NotFoundException(
        "Inventory not found for this product and vendor",
      );
    }

    if (inventory.quantityAvailable < quantity) {
      throw new BadRequestException("Insufficient stock available to reserve");
    }

    inventory.quantityAvailable -= quantity;
    inventory.quantityReserved += quantity;
    return await this.inventoryRepository.save(inventory);
  }

  async releaseReservedStock(
    productId: string,
    vendorId: string,
    quantity: number,
  ): Promise<Inventory> {
    const inventory = await this.findByProductAndVendor(productId, vendorId);

    if (!inventory) {
      throw new NotFoundException(
        "Inventory not found for this product and vendor",
      );
    }

    if (inventory.quantityReserved < quantity) {
      throw new BadRequestException("Insufficient reserved stock");
    }

    inventory.quantityReserved -= quantity;
    inventory.quantityAvailable += quantity;
    return await this.inventoryRepository.save(inventory);
  }
}
