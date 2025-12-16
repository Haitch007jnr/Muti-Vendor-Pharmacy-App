import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { PosSession, PosTransaction, PosSessionStatus, PaymentMethod } from './entities/pos.entity';
import { CreatePosSessionDto, CreatePosTransactionDto, ClosePosSessionDto } from './dto/pos.dto';

@Injectable()
export class PosService {
  constructor(
    @InjectRepository(PosSession)
    private readonly posSessionRepository: Repository<PosSession>,
    @InjectRepository(PosTransaction)
    private readonly posTransactionRepository: Repository<PosTransaction>,
  ) {}

  // POS Session Management
  async openSession(createPosSessionDto: CreatePosSessionDto, cashierId: string): Promise<PosSession> {
    // Check if there's already an open session for this cashier
    const existingSession = await this.posSessionRepository.findOne({
      where: {
        cashierId,
        status: PosSessionStatus.OPEN,
      },
    });

    if (existingSession) {
      throw new BadRequestException('Cashier already has an open session');
    }

    const sessionNumber = await this.generateSessionNumber(createPosSessionDto.vendorId);

    const session = this.posSessionRepository.create({
      ...createPosSessionDto,
      sessionNumber,
      cashierId,
      status: PosSessionStatus.OPEN,
      openedAt: new Date(),
    });

    return await this.posSessionRepository.save(session);
  }

  async closeSession(id: string, closePosSessionDto: ClosePosSessionDto): Promise<PosSession> {
    const session = await this.findSession(id);

    if (session.status === PosSessionStatus.CLOSED) {
      throw new BadRequestException('Session is already closed');
    }

    session.status = PosSessionStatus.CLOSED;
    session.closingBalance = closePosSessionDto.closingBalance;
    session.expectedBalance = session.openingBalance + session.totalSales;
    session.closedAt = new Date();

    if (closePosSessionDto.notes) {
      session.notes = closePosSessionDto.notes;
    }

    return await this.posSessionRepository.save(session);
  }

  async findSession(id: string): Promise<PosSession> {
    const session = await this.posSessionRepository.findOne({
      where: { id },
      relations: ['transactions'],
    });

    if (!session) {
      throw new NotFoundException(`POS session with ID ${id} not found`);
    }

    return session;
  }

  async getActiveSessions(vendorId: string): Promise<PosSession[]> {
    return await this.posSessionRepository.find({
      where: {
        vendorId,
        status: PosSessionStatus.OPEN,
      },
      order: { openedAt: 'DESC' },
    });
  }

  async getSessionsByCashier(cashierId: string, limit: number = 10): Promise<PosSession[]> {
    return await this.posSessionRepository.find({
      where: { cashierId },
      order: { openedAt: 'DESC' },
      take: limit,
    });
  }

  // POS Transactions
  async createTransaction(
    createPosTransactionDto: CreatePosTransactionDto,
    cashierId: string,
  ): Promise<PosTransaction> {
    const session = await this.findSession(createPosTransactionDto.sessionId);

    if (session.status === PosSessionStatus.CLOSED) {
      throw new BadRequestException('Cannot create transaction in a closed session');
    }

    // Calculate totals
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    createPosTransactionDto.items.forEach((item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscount = item.discountPercentage ? (itemSubtotal * item.discountPercentage) / 100 : 0;
      const itemTax = item.taxPercentage ? ((itemSubtotal - itemDiscount) * item.taxPercentage) / 100 : 0;

      subtotal += itemSubtotal;
      totalDiscount += itemDiscount;
      totalTax += itemTax;
    });

    const totalAmount = subtotal - totalDiscount + totalTax;
    const changeAmount = createPosTransactionDto.amountPaid - totalAmount;

    if (changeAmount < 0) {
      throw new BadRequestException('Amount paid is less than total amount');
    }

    const transactionNumber = await this.generateTransactionNumber(session.vendorId);

    const transaction = this.posTransactionRepository.create({
      transactionNumber,
      sessionId: session.id,
      vendorId: session.vendorId,
      cashierId,
      customerId: createPosTransactionDto.customerId,
      subtotal,
      discountAmount: totalDiscount,
      taxAmount: totalTax,
      totalAmount,
      amountPaid: createPosTransactionDto.amountPaid,
      changeAmount,
      paymentMethod: createPosTransactionDto.paymentMethod,
      notes: createPosTransactionDto.notes,
    });

    const savedTransaction = await this.posTransactionRepository.save(transaction);

    // Update session totals
    await this.updateSessionTotals(session.id, totalAmount, createPosTransactionDto.paymentMethod);

    // TODO: Create corresponding sales record
    // TODO: Update inventory

    return savedTransaction;
  }

  async findTransaction(id: string): Promise<PosTransaction> {
    const transaction = await this.posTransactionRepository.findOne({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException(`POS transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async getSessionTransactions(sessionId: string): Promise<PosTransaction[]> {
    return await this.posTransactionRepository.find({
      where: { sessionId },
      order: { createdAt: 'DESC' },
    });
  }

  async markReceiptPrinted(transactionId: string): Promise<PosTransaction> {
    const transaction = await this.findTransaction(transactionId);
    transaction.receiptPrinted = true;
    return await this.posTransactionRepository.save(transaction);
  }

  // Product Search for POS
  async searchProducts(
    vendorId: string,
    searchTerm: string,
    limit: number = 20,
  ): Promise<any[]> {
    // This would typically query the products table
    // For now, we'll return a placeholder that should be implemented with the products module
    // TODO: Integrate with products service to search by SKU, barcode, or name
    
    // Example query structure (to be implemented with proper products repository)
    /*
    return await this.productsRepository.find({
      where: [
        { vendorId, sku: Like(`%${searchTerm}%`), isActive: true },
        { vendorId, barcode: Like(`%${searchTerm}%`), isActive: true },
        { vendorId, name: Like(`%${searchTerm}%`), isActive: true },
      ],
      take: limit,
      relations: ['inventory'],
    });
    */
    
    return [];
  }

  // Helper Methods
  private async updateSessionTotals(
    sessionId: string,
    amount: number,
    paymentMethod: PaymentMethod,
  ): Promise<void> {
    const session = await this.findSession(sessionId);

    session.totalSales = Number(session.totalSales) + amount;
    session.totalTransactions += 1;

    switch (paymentMethod) {
      case PaymentMethod.CASH:
        session.cashSales = Number(session.cashSales) + amount;
        break;
      case PaymentMethod.CARD:
        session.cardSales = Number(session.cardSales) + amount;
        break;
      case PaymentMethod.BANK_TRANSFER:
        session.bankTransferSales = Number(session.bankTransferSales) + amount;
        break;
    }

    await this.posSessionRepository.save(session);
  }

  private async generateSessionNumber(vendorId: string): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const count = await this.posSessionRepository.count({ where: { vendorId } });
    const sequence = String(count + 1).padStart(4, '0');

    return `POS-${year}${month}${day}-${sequence}`;
  }

  private async generateTransactionNumber(vendorId: string): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const count = await this.posTransactionRepository.count({ where: { vendorId } });
    const sequence = String(count + 1).padStart(6, '0');

    return `TXN-${year}${month}${day}-${sequence}`;
  }

  // Reporting
  async getSessionReport(sessionId: string): Promise<any> {
    const session = await this.findSession(sessionId);
    const transactions = await this.getSessionTransactions(sessionId);

    return {
      session,
      transactions,
      summary: {
        totalTransactions: session.totalTransactions,
        totalSales: session.totalSales,
        cashSales: session.cashSales,
        cardSales: session.cardSales,
        bankTransferSales: session.bankTransferSales,
        openingBalance: session.openingBalance,
        closingBalance: session.closingBalance,
        expectedBalance: session.expectedBalance,
        variance: session.closingBalance ? session.closingBalance - session.expectedBalance : 0,
      },
    };
  }
}
