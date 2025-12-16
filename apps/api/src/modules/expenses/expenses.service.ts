import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}

  async create(createExpenseDto: CreateExpenseDto, userId: string): Promise<Expense> {
    const expense = this.expenseRepository.create({
      ...createExpenseDto,
      createdBy: userId,
    });

    return await this.expenseRepository.save(expense);
  }

  async findAll(query: QueryExpenseDto): Promise<{ data: Expense[]; total: number; page: number; limit: number }> {
    const { vendorId, category, startDate, endDate, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (vendorId) {
      where.vendorId = vendorId;
    }

    if (category) {
      where.category = category;
    }

    if (startDate && endDate) {
      where.date = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.date = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      where.date = LessThanOrEqual(new Date(endDate));
    }

    const [data, total] = await this.expenseRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { date: 'DESC', createdAt: 'DESC' },
    });

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  async findOne(id: string): Promise<Expense> {
    const expense = await this.expenseRepository.findOne({ where: { id } });

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    return expense;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto): Promise<Expense> {
    const expense = await this.findOne(id);

    Object.assign(expense, updateExpenseDto);

    return await this.expenseRepository.save(expense);
  }

  async remove(id: string): Promise<void> {
    const expense = await this.findOne(id);
    await this.expenseRepository.remove(expense);
  }

  async getTotalByCategory(vendorId: string, startDate?: string, endDate?: string): Promise<any[]> {
    const query = this.expenseRepository
      .createQueryBuilder('expense')
      .select('expense.category', 'category')
      .addSelect('SUM(expense.amount)', 'total')
      .where('expense.vendorId = :vendorId', { vendorId })
      .groupBy('expense.category');

    if (startDate && endDate) {
      query.andWhere('expense.date BETWEEN :startDate AND :endDate', { startDate, endDate });
    } else if (startDate) {
      query.andWhere('expense.date >= :startDate', { startDate });
    } else if (endDate) {
      query.andWhere('expense.date <= :endDate', { endDate });
    }

    return await query.getRawMany();
  }

  async getTotalExpenses(vendorId: string, startDate?: string, endDate?: string): Promise<number> {
    const query = this.expenseRepository
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'total')
      .where('expense.vendorId = :vendorId', { vendorId });

    if (startDate && endDate) {
      query.andWhere('expense.date BETWEEN :startDate AND :endDate', { startDate, endDate });
    } else if (startDate) {
      query.andWhere('expense.date >= :startDate', { startDate });
    } else if (endDate) {
      query.andWhere('expense.date <= :endDate', { endDate });
    }

    const result = await query.getRawOne();
    return Number(result?.total || 0);
  }
}
