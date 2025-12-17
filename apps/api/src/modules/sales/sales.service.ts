import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Repository,
  Between,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  IsNull,
} from "typeorm";
import {
  Sales,
  SalesItem,
  SalesStatus,
  PaymentStatus,
} from "./entities/sales.entity";
import { CreateSalesDto } from "./dto/create-sales.dto";
import { UpdateSalesDto } from "./dto/update-sales.dto";
import { QuerySalesDto } from "./dto/query-sales.dto";

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sales)
    private readonly salesRepository: Repository<Sales>,
    @InjectRepository(SalesItem)
    private readonly salesItemRepository: Repository<SalesItem>,
  ) {}

  async create(createSalesDto: CreateSalesDto, userId: string): Promise<Sales> {
    // Generate sales number
    const salesNumber = await this.generateSalesNumber(createSalesDto.vendorId);

    // Calculate totals
    const { subtotal, totalDiscount, totalTax, items } = this.calculateTotals(
      createSalesDto.items,
    );
    const totalAmount = subtotal - totalDiscount + totalTax;

    const sales = this.salesRepository.create({
      ...createSalesDto,
      salesNumber,
      subtotal,
      discountAmount: totalDiscount,
      taxAmount: totalTax,
      totalAmount,
      balanceDue: totalAmount,
      createdBy: userId,
      status: SalesStatus.QUOTATION,
      paymentStatus: PaymentStatus.PENDING,
    });

    const savedSales = await this.salesRepository.save(sales);

    // Save sales items - flatten if needed and add salesId
    const salesItemsToSave = items.map((item) => ({
      ...item,
      salesId: savedSales.id,
    }));

    await this.salesItemRepository.save(salesItemsToSave);

    return this.findOne(savedSales.id);
  }

  async findAll(
    query: QuerySalesDto,
  ): Promise<{ data: Sales[]; total: number; page: number; limit: number }> {
    const {
      vendorId,
      clientId,
      customerId,
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

    if (clientId) {
      where.clientId = clientId;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (status) {
      where.status = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (startDate && endDate) {
      where.salesDate = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.salesDate = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      where.salesDate = LessThanOrEqual(new Date(endDate));
    }

    const [data, total] = await this.salesRepository.findAndCount({
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

  async findOne(id: string): Promise<Sales> {
    const sales = await this.salesRepository.findOne({
      where: { id },
      relations: ["items"],
    });

    if (!sales) {
      throw new NotFoundException(`Sales with ID ${id} not found`);
    }

    return sales;
  }

  async update(
    id: string,
    updateSalesDto: UpdateSalesDto,
    userId?: string,
  ): Promise<Sales> {
    const sales = await this.findOne(id);

    // Handle status transitions
    if (updateSalesDto.status) {
      await this.validateStatusTransition(sales.status, updateSalesDto.status);

      if (updateSalesDto.status === SalesStatus.CONFIRMED) {
        sales.approvedBy = userId;
        sales.approvedAt = new Date();
      }

      if (updateSalesDto.status === SalesStatus.INVOICED) {
        sales.invoiceNumber = await this.generateInvoiceNumber(sales.vendorId);
        sales.invoicedAt = new Date();
      }

      if (updateSalesDto.status === SalesStatus.PAID) {
        sales.paidAt = new Date();
        sales.paidAmount = sales.totalAmount;
        sales.balanceDue = 0;
        sales.paymentStatus = PaymentStatus.COMPLETED;
      }
    }

    // Handle payment
    if (updateSalesDto.paidAmount !== undefined) {
      sales.paidAmount = updateSalesDto.paidAmount;
      sales.balanceDue = sales.totalAmount - updateSalesDto.paidAmount;

      if (sales.balanceDue <= 0) {
        sales.paymentStatus = PaymentStatus.COMPLETED;
        sales.status = SalesStatus.PAID;
        sales.paidAt = new Date();
      }
    }

    // Recalculate totals if items are updated
    if (updateSalesDto.items) {
      await this.salesItemRepository.delete({ salesId: id });

      const { subtotal, totalDiscount, totalTax, items } = this.calculateTotals(
        updateSalesDto.items,
      );
      const totalAmount = subtotal - totalDiscount + totalTax;

      await this.salesItemRepository.save(
        items.map((item) => ({ ...item, salesId: id })),
      );

      sales.subtotal = subtotal;
      sales.discountAmount = totalDiscount;
      sales.taxAmount = totalTax;
      sales.totalAmount = totalAmount;
      sales.balanceDue = totalAmount - sales.paidAmount;
    }

    Object.assign(sales, updateSalesDto);

    await this.salesRepository.save(sales);

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const sales = await this.findOne(id);

    if (sales.status === SalesStatus.PAID) {
      throw new BadRequestException("Cannot delete a paid sales record");
    }

    await this.salesRepository.remove(sales);
  }

  async confirmSales(id: string, userId: string): Promise<Sales> {
    const sales = await this.findOne(id);

    if (sales.status !== SalesStatus.QUOTATION) {
      throw new BadRequestException("Only quotations can be confirmed");
    }

    sales.status = SalesStatus.CONFIRMED;
    sales.approvedBy = userId;
    sales.approvedAt = new Date();

    return await this.salesRepository.save(sales);
  }

  async generateInvoice(id: string): Promise<Sales> {
    const sales = await this.findOne(id);

    if (sales.status !== SalesStatus.CONFIRMED) {
      throw new BadRequestException("Only confirmed sales can be invoiced");
    }

    sales.status = SalesStatus.INVOICED;
    sales.invoiceNumber = await this.generateInvoiceNumber(sales.vendorId);
    sales.invoicedAt = new Date();

    return await this.salesRepository.save(sales);
  }

  async recordPayment(
    id: string,
    amount: number,
    paymentMethod: string,
  ): Promise<Sales> {
    const sales = await this.findOne(id);

    if (
      sales.status === SalesStatus.CANCELLED ||
      sales.status === SalesStatus.RETURNED
    ) {
      throw new BadRequestException(
        "Cannot record payment for cancelled or returned sales",
      );
    }

    sales.paidAmount = Number(sales.paidAmount) + amount;
    sales.balanceDue = Number(sales.totalAmount) - Number(sales.paidAmount);
    sales.paymentMethod = paymentMethod as any;

    if (sales.balanceDue <= 0) {
      sales.status = SalesStatus.PAID;
      sales.paymentStatus = PaymentStatus.COMPLETED;
      sales.paidAt = new Date();
    } else {
      sales.paymentStatus = PaymentStatus.PROCESSING;
    }

    return await this.salesRepository.save(sales);
  }

  async cancelSales(id: string): Promise<Sales> {
    const sales = await this.findOne(id);

    if (sales.status === SalesStatus.PAID) {
      throw new BadRequestException("Cannot cancel a paid sales record");
    }

    sales.status = SalesStatus.CANCELLED;

    return await this.salesRepository.save(sales);
  }

  async returnSales(
    id: string,
    returnItems?: Array<{ itemId: string; quantity: number }>,
  ): Promise<Sales> {
    const sales = await this.findOne(id);

    if (
      sales.status !== SalesStatus.PAID &&
      sales.status !== SalesStatus.INVOICED
    ) {
      throw new BadRequestException(
        "Only paid or invoiced sales can be returned",
      );
    }

    if (returnItems && returnItems.length > 0) {
      for (const returnItem of returnItems) {
        const item = await this.salesItemRepository.findOne({
          where: { id: returnItem.itemId },
        });
        if (item) {
          item.returnedQuantity = returnItem.quantity;
          await this.salesItemRepository.save(item);
        }
      }
    }

    sales.status = SalesStatus.RETURNED;
    sales.paymentStatus = PaymentStatus.REFUNDED;

    return await this.salesRepository.save(sales);
  }

  async getTotalSales(
    vendorId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<number> {
    const query = this.salesRepository
      .createQueryBuilder("sales")
      .select("SUM(sales.total_amount)", "total")
      .where("sales.vendorId = :vendorId", { vendorId })
      .andWhere("sales.status != :status", { status: SalesStatus.CANCELLED });

    if (startDate && endDate) {
      query.andWhere("sales.sales_date BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      });
    } else if (startDate) {
      query.andWhere("sales.sales_date >= :startDate", { startDate });
    } else if (endDate) {
      query.andWhere("sales.sales_date <= :endDate", { endDate });
    }

    const result = await query.getRawOne();
    return Number(result?.total || 0);
  }

  async getSalesByStatus(
    vendorId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<any[]> {
    const query = this.salesRepository
      .createQueryBuilder("sales")
      .select("sales.status", "status")
      .addSelect("COUNT(sales.id)", "count")
      .addSelect("SUM(sales.total_amount)", "total")
      .where("sales.vendorId = :vendorId", { vendorId })
      .groupBy("sales.status");

    if (startDate && endDate) {
      query.andWhere("sales.sales_date BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      });
    } else if (startDate) {
      query.andWhere("sales.sales_date >= :startDate", { startDate });
    } else if (endDate) {
      query.andWhere("sales.sales_date <= :endDate", { endDate });
    }

    return await query.getRawMany();
  }

  private calculateTotals(items: Array<any>): {
    subtotal: number;
    totalDiscount: number;
    totalTax: number;
    items: Array<any>;
  } {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    const processedItems = items.map((item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
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

    return { subtotal, totalDiscount, totalTax, items: processedItems };
  }

  private async generateSalesNumber(vendorId: string): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    const count = await this.salesRepository.count({ where: { vendorId } });
    const sequence = String(count + 1).padStart(5, "0");

    return `SO-${year}${month}-${sequence}`;
  }

  private async generateInvoiceNumber(vendorId: string): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    const count = await this.salesRepository.count({
      where: { vendorId, invoiceNumber: Not(IsNull()) },
    });
    const sequence = String(count + 1).padStart(5, "0");

    return `INV-${year}${month}-${sequence}`;
  }

  private async validateStatusTransition(
    currentStatus: SalesStatus,
    newStatus: SalesStatus,
  ): Promise<void> {
    const validTransitions: Record<SalesStatus, SalesStatus[]> = {
      [SalesStatus.QUOTATION]: [SalesStatus.CONFIRMED, SalesStatus.CANCELLED],
      [SalesStatus.CONFIRMED]: [SalesStatus.INVOICED, SalesStatus.CANCELLED],
      [SalesStatus.INVOICED]: [
        SalesStatus.PAID,
        SalesStatus.CANCELLED,
        SalesStatus.RETURNED,
      ],
      [SalesStatus.PAID]: [SalesStatus.RETURNED],
      [SalesStatus.CANCELLED]: [],
      [SalesStatus.RETURNED]: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }
}
