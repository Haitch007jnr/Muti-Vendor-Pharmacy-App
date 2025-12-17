import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import {
  Purchase,
  PurchaseItem,
  PurchaseStatus,
  PaymentStatus,
} from "./entities/purchase.entity";
import { CreatePurchaseDto } from "./dto/create-purchase.dto";
import { UpdatePurchaseDto } from "./dto/update-purchase.dto";
import { QueryPurchaseDto } from "./dto/query-purchase.dto";

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Purchase)
    private readonly purchaseRepository: Repository<Purchase>,
    @InjectRepository(PurchaseItem)
    private readonly purchaseItemRepository: Repository<PurchaseItem>,
  ) {}

  async create(
    createPurchaseDto: CreatePurchaseDto,
    userId: string,
  ): Promise<Purchase> {
    // Generate purchase number
    const purchaseNumber = await this.generatePurchaseNumber(
      createPurchaseDto.vendorId,
    );

    // Calculate totals
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    const items = createPurchaseDto.items.map((item) => {
      const itemSubtotal = item.quantity * item.unitCost;
      const itemDiscount = item.discountPercentage
        ? (itemSubtotal * item.discountPercentage) / 100
        : 0;
      const itemTax = item.taxPercentage
        ? ((itemSubtotal - itemDiscount) * item.taxPercentage) / 100
        : 0;
      const finalSubtotal = itemSubtotal - itemDiscount + itemTax;

      subtotal += itemSubtotal;
      totalDiscount += itemDiscount;
      totalTax += itemTax;

      return {
        ...item,
        discountAmount: itemDiscount,
        taxAmount: itemTax,
        subtotal: finalSubtotal,
      };
    });

    const shippingCost = createPurchaseDto.shippingCost || 0;
    const totalAmount = subtotal - totalDiscount + totalTax + shippingCost;

    const purchase = this.purchaseRepository.create({
      ...createPurchaseDto,
      purchaseNumber,
      subtotal,
      discountAmount: totalDiscount,
      taxAmount: totalTax,
      shippingCost,
      totalAmount,
      createdBy: userId,
      status: PurchaseStatus.DRAFT,
      paymentStatus: PaymentStatus.PENDING,
    });

    const savedPurchase = await this.purchaseRepository.save(purchase);

    // Save purchase items
    const purchaseItems = items.map((item) =>
      this.purchaseItemRepository.create({
        ...item,
        purchaseId: savedPurchase.id,
      }),
    );

    await this.purchaseItemRepository.save(purchaseItems);

    return this.findOne(savedPurchase.id);
  }

  async findAll(
    query: QueryPurchaseDto,
  ): Promise<{ data: Purchase[]; total: number; page: number; limit: number }> {
    const {
      vendorId,
      supplierId,
      status,
      paymentStatus,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (vendorId) {
      where.vendorId = vendorId;
    }

    if (supplierId) {
      where.supplierId = supplierId;
    }

    if (status) {
      where.status = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (startDate && endDate) {
      where.purchaseDate = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.purchaseDate = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      where.purchaseDate = LessThanOrEqual(new Date(endDate));
    }

    const [data, total] = await this.purchaseRepository.findAndCount({
      where,
      relations: ["items"],
      skip,
      take: limit,
      order: { createdAt: "DESC" },
    });

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  async findOne(id: string): Promise<Purchase> {
    const purchase = await this.purchaseRepository.findOne({
      where: { id },
      relations: ["items"],
    });

    if (!purchase) {
      throw new NotFoundException(`Purchase with ID ${id} not found`);
    }

    return purchase;
  }

  async update(
    id: string,
    updatePurchaseDto: UpdatePurchaseDto,
    userId?: string,
  ): Promise<Purchase> {
    const purchase = await this.findOne(id);

    // Handle status transitions
    if (updatePurchaseDto.status) {
      await this.validateStatusTransition(
        purchase.status,
        updatePurchaseDto.status,
      );

      if (updatePurchaseDto.status === PurchaseStatus.APPROVED) {
        purchase.approvedBy = userId;
        purchase.approvedAt = new Date();
      }

      if (updatePurchaseDto.status === PurchaseStatus.RECEIVED) {
        purchase.receivedBy = userId;
        purchase.receivedAt = new Date();
        // TODO: Update inventory when purchase is received
      }
    }

    // Recalculate totals if items are updated
    if (updatePurchaseDto.items) {
      // Delete existing items
      await this.purchaseItemRepository.delete({ purchaseId: id });

      let subtotal = 0;
      let totalDiscount = 0;
      let totalTax = 0;

      const items = updatePurchaseDto.items.map((item) => {
        const itemSubtotal = item.quantity * item.unitCost;
        const itemDiscount = item.discountPercentage
          ? (itemSubtotal * item.discountPercentage) / 100
          : 0;
        const itemTax = item.taxPercentage
          ? ((itemSubtotal - itemDiscount) * item.taxPercentage) / 100
          : 0;
        const finalSubtotal = itemSubtotal - itemDiscount + itemTax;

        subtotal += itemSubtotal;
        totalDiscount += itemDiscount;
        totalTax += itemTax;

        return {
          ...item,
          discountAmount: itemDiscount,
          taxAmount: itemTax,
          subtotal: finalSubtotal,
          purchaseId: id,
        };
      });

      await this.purchaseItemRepository.save(items);

      const shippingCost =
        updatePurchaseDto.shippingCost || purchase.shippingCost;
      purchase.subtotal = subtotal;
      purchase.discountAmount = totalDiscount;
      purchase.taxAmount = totalTax;
      purchase.shippingCost = shippingCost;
      purchase.totalAmount = subtotal - totalDiscount + totalTax + shippingCost;
    }

    Object.assign(purchase, updatePurchaseDto);

    await this.purchaseRepository.save(purchase);

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const purchase = await this.findOne(id);

    if (purchase.status === PurchaseStatus.RECEIVED) {
      throw new BadRequestException("Cannot delete a received purchase");
    }

    await this.purchaseRepository.remove(purchase);
  }

  async approvePurchase(id: string, userId: string): Promise<Purchase> {
    const purchase = await this.findOne(id);

    if (purchase.status !== PurchaseStatus.PENDING) {
      throw new BadRequestException("Only pending purchases can be approved");
    }

    purchase.status = PurchaseStatus.APPROVED;
    purchase.approvedBy = userId;
    purchase.approvedAt = new Date();

    return await this.purchaseRepository.save(purchase);
  }

  async receivePurchase(
    id: string,
    userId: string,
    receivedItems?: Array<{ itemId: string; quantity: number }>,
  ): Promise<Purchase> {
    const purchase = await this.findOne(id);

    if (purchase.status !== PurchaseStatus.APPROVED) {
      throw new BadRequestException("Only approved purchases can be received");
    }

    // Update received quantities if provided
    if (receivedItems && receivedItems.length > 0) {
      for (const receivedItem of receivedItems) {
        await this.purchaseItemRepository.update(
          { id: receivedItem.itemId },
          { receivedQuantity: receivedItem.quantity },
        );
      }
    }

    purchase.status = PurchaseStatus.RECEIVED;
    purchase.receivedBy = userId;
    purchase.receivedAt = new Date();
    purchase.actualDeliveryDate = new Date();

    // TODO: Update inventory with received items

    return await this.purchaseRepository.save(purchase);
  }

  async cancelPurchase(id: string): Promise<Purchase> {
    const purchase = await this.findOne(id);

    if (purchase.status === PurchaseStatus.RECEIVED) {
      throw new BadRequestException("Cannot cancel a received purchase");
    }

    purchase.status = PurchaseStatus.CANCELLED;

    return await this.purchaseRepository.save(purchase);
  }

  async getAveragePurchasePrice(
    productId: string,
    vendorId: string,
  ): Promise<number> {
    const result = await this.purchaseItemRepository
      .createQueryBuilder("item")
      .innerJoin("item.purchase", "purchase")
      .select("AVG(item.unit_cost)", "avgPrice")
      .where("item.productId = :productId", { productId })
      .andWhere("purchase.vendorId = :vendorId", { vendorId })
      .andWhere("purchase.status = :status", {
        status: PurchaseStatus.RECEIVED,
      })
      .getRawOne();

    return Number(result?.avgPrice || 0);
  }

  async getTotalPurchases(
    vendorId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<number> {
    const query = this.purchaseRepository
      .createQueryBuilder("purchase")
      .select("SUM(purchase.total_amount)", "total")
      .where("purchase.vendorId = :vendorId", { vendorId })
      .andWhere("purchase.status != :status", {
        status: PurchaseStatus.CANCELLED,
      });

    if (startDate && endDate) {
      query.andWhere("purchase.purchase_date BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      });
    } else if (startDate) {
      query.andWhere("purchase.purchase_date >= :startDate", { startDate });
    } else if (endDate) {
      query.andWhere("purchase.purchase_date <= :endDate", { endDate });
    }

    const result = await query.getRawOne();
    return Number(result?.total || 0);
  }

  private async generatePurchaseNumber(vendorId: string): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    const count = await this.purchaseRepository.count({
      where: { vendorId },
    });

    const sequence = String(count + 1).padStart(5, "0");

    return `PO-${year}${month}-${sequence}`;
  }

  private async validateStatusTransition(
    currentStatus: PurchaseStatus,
    newStatus: PurchaseStatus,
  ): Promise<void> {
    const validTransitions: Record<PurchaseStatus, PurchaseStatus[]> = {
      [PurchaseStatus.DRAFT]: [
        PurchaseStatus.PENDING,
        PurchaseStatus.CANCELLED,
      ],
      [PurchaseStatus.PENDING]: [
        PurchaseStatus.APPROVED,
        PurchaseStatus.CANCELLED,
      ],
      [PurchaseStatus.APPROVED]: [
        PurchaseStatus.RECEIVED,
        PurchaseStatus.CANCELLED,
      ],
      [PurchaseStatus.RECEIVED]: [],
      [PurchaseStatus.CANCELLED]: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }
}
