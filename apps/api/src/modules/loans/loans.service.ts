import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { Loan, LoanStatus } from "./entities/loan.entity";
import { LoanAuthority } from "./entities/loan-authority.entity";
import { LoanPayment } from "./entities/loan-payment.entity";
import { CreateLoanDto } from "./dto/create-loan.dto";
import { UpdateLoanDto } from "./dto/update-loan.dto";
import { QueryLoanDto } from "./dto/query-loan.dto";
import { CreateLoanAuthorityDto } from "./dto/create-loan-authority.dto";
import { UpdateLoanAuthorityDto } from "./dto/update-loan-authority.dto";
import { CreateLoanPaymentDto } from "./dto/create-loan-payment.dto";

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    @InjectRepository(LoanAuthority)
    private readonly authorityRepository: Repository<LoanAuthority>,
    @InjectRepository(LoanPayment)
    private readonly paymentRepository: Repository<LoanPayment>,
  ) {}

  // Loan Authority Methods
  async createAuthority(
    createAuthorityDto: CreateLoanAuthorityDto,
  ): Promise<LoanAuthority> {
    const authority = this.authorityRepository.create(createAuthorityDto);
    return await this.authorityRepository.save(authority);
  }

  async findAllAuthorities(
    vendorId: string,
  ): Promise<LoanAuthority[]> {
    return await this.authorityRepository.find({
      where: { vendorId },
      order: { createdAt: "DESC" },
    });
  }

  async findOneAuthority(id: string): Promise<LoanAuthority> {
    const authority = await this.authorityRepository.findOne({
      where: { id },
      relations: ["loans"],
    });

    if (!authority) {
      throw new NotFoundException(`Loan authority with ID ${id} not found`);
    }

    return authority;
  }

  async updateAuthority(
    id: string,
    updateAuthorityDto: UpdateLoanAuthorityDto,
  ): Promise<LoanAuthority> {
    const authority = await this.findOneAuthority(id);
    Object.assign(authority, updateAuthorityDto);
    return await this.authorityRepository.save(authority);
  }

  async removeAuthority(id: string): Promise<void> {
    const authority = await this.findOneAuthority(id);
    
    // Check if authority has active loans
    const activeLoans = await this.loanRepository.count({
      where: { authorityId: id, status: LoanStatus.ACTIVE },
    });

    if (activeLoans > 0) {
      throw new BadRequestException(
        `Cannot delete authority with ${activeLoans} active loan(s)`,
      );
    }

    await this.authorityRepository.remove(authority);
  }

  // Loan Methods
  private calculateLoanDetails(
    principalAmount: number,
    interestRate: number,
    tenureMonths: number,
    startDate: Date,
  ): { interestAmount: number; totalAmount: number; monthlyPayment: number; endDate: Date } {
    // Calculate simple interest
    const interestAmount = (principalAmount * interestRate * tenureMonths) / (12 * 100);
    const totalAmount = principalAmount + interestAmount;
    const monthlyPayment = totalAmount / tenureMonths;

    // Calculate end date
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + tenureMonths);

    return {
      interestAmount,
      totalAmount,
      monthlyPayment,
      endDate,
    };
  }

  async create(createLoanDto: CreateLoanDto): Promise<Loan> {
    // Verify authority exists
    await this.findOneAuthority(createLoanDto.authorityId);

    // Check if reference number already exists
    const existing = await this.loanRepository.findOne({
      where: { referenceNumber: createLoanDto.referenceNumber },
    });

    if (existing) {
      throw new BadRequestException(
        `Loan with reference number ${createLoanDto.referenceNumber} already exists`,
      );
    }

    const startDate = new Date(createLoanDto.startDate);
    const { interestAmount, totalAmount, monthlyPayment, endDate } =
      this.calculateLoanDetails(
        createLoanDto.principalAmount,
        createLoanDto.interestRate,
        createLoanDto.tenureMonths,
        startDate,
      );

    const loan = this.loanRepository.create({
      ...createLoanDto,
      startDate,
      endDate,
      interestAmount,
      totalAmount,
      monthlyPayment,
      balance: totalAmount,
      amountPaid: 0,
      status: LoanStatus.ACTIVE,
    });

    return await this.loanRepository.save(loan);
  }

  async findAll(
    query: QueryLoanDto,
  ): Promise<{ data: Loan[]; total: number; page: number; limit: number }> {
    const {
      vendorId,
      authorityId,
      loanType,
      status,
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

    if (authorityId) {
      where.authorityId = authorityId;
    }

    if (loanType) {
      where.loanType = loanType;
    }

    if (status) {
      where.status = status;
    }

    if (startDate && endDate) {
      where.startDate = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.startDate = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      where.startDate = LessThanOrEqual(new Date(endDate));
    }

    const [data, total] = await this.loanRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: "DESC" },
      relations: ["authority"],
    });

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  async findOne(id: string): Promise<Loan> {
    const loan = await this.loanRepository.findOne({
      where: { id },
      relations: ["authority", "payments"],
    });

    if (!loan) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }

    return loan;
  }

  async update(id: string, updateLoanDto: UpdateLoanDto): Promise<Loan> {
    const loan = await this.findOne(id);

    // If updating key loan parameters, recalculate
    if (
      updateLoanDto.principalAmount ||
      updateLoanDto.interestRate ||
      updateLoanDto.tenureMonths ||
      updateLoanDto.startDate
    ) {
      const principalAmount = updateLoanDto.principalAmount || loan.principalAmount;
      const interestRate = updateLoanDto.interestRate || loan.interestRate;
      const tenureMonths = updateLoanDto.tenureMonths || loan.tenureMonths;
      const startDate = updateLoanDto.startDate
        ? new Date(updateLoanDto.startDate)
        : loan.startDate;

      const { interestAmount, totalAmount, monthlyPayment, endDate } =
        this.calculateLoanDetails(
          principalAmount,
          interestRate,
          tenureMonths,
          startDate,
        );

      Object.assign(loan, updateLoanDto, {
        interestAmount,
        totalAmount,
        monthlyPayment,
        endDate,
        balance: totalAmount - loan.amountPaid,
      });
    } else {
      Object.assign(loan, updateLoanDto);
    }

    return await this.loanRepository.save(loan);
  }

  async remove(id: string): Promise<void> {
    const loan = await this.findOne(id);
    
    if (loan.status === LoanStatus.ACTIVE && loan.amountPaid > 0) {
      throw new BadRequestException(
        "Cannot delete an active loan with payments. Mark it as paid or defaulted instead.",
      );
    }

    await this.loanRepository.remove(loan);
  }

  // Loan Payment Methods
  async createPayment(
    createPaymentDto: CreateLoanPaymentDto,
  ): Promise<LoanPayment> {
    const loan = await this.findOne(createPaymentDto.loanId);

    if (loan.status !== LoanStatus.ACTIVE) {
      throw new BadRequestException(`Loan is not active`);
    }

    if (createPaymentDto.amount > loan.balance) {
      throw new BadRequestException(
        `Payment amount (${createPaymentDto.amount}) exceeds outstanding balance (${loan.balance})`,
      );
    }

    // Calculate balance after payment
    const balanceAfter = loan.balance - createPaymentDto.amount;

    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      balanceAfter,
      paymentDate: new Date(createPaymentDto.paymentDate),
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Update loan
    loan.amountPaid = Number(loan.amountPaid) + Number(createPaymentDto.amount);
    loan.balance = balanceAfter;

    if (loan.balance === 0) {
      loan.status = LoanStatus.PAID;
    }

    await this.loanRepository.save(loan);

    return savedPayment;
  }

  async findAllPayments(loanId: string): Promise<LoanPayment[]> {
    return await this.paymentRepository.find({
      where: { loanId },
      order: { paymentDate: "DESC" },
    });
  }

  async getLoanSummary(vendorId: string): Promise<any> {
    const query = this.loanRepository
      .createQueryBuilder("loan")
      .where("loan.vendorId = :vendorId", { vendorId });

    const totalLoansQuery = query.clone();
    const activeLoansQuery = query
      .clone()
      .andWhere("loan.status = :status", { status: LoanStatus.ACTIVE });

    const [totalCount, activeCount] = await Promise.all([
      totalLoansQuery.getCount(),
      activeLoansQuery.getCount(),
    ]);

    const totalAmountResult = await query
      .clone()
      .select("SUM(loan.totalAmount)", "total")
      .getRawOne();

    const outstandingResult = await activeLoansQuery
      .clone()
      .select("SUM(loan.balance)", "outstanding")
      .getRawOne();

    const paidResult = await query
      .clone()
      .select("SUM(loan.amountPaid)", "paid")
      .getRawOne();

    return {
      totalLoans: totalCount,
      activeLoans: activeCount,
      totalAmount: Number(totalAmountResult?.total || 0),
      outstandingBalance: Number(outstandingResult?.outstanding || 0),
      totalPaid: Number(paidResult?.paid || 0),
    };
  }
}
