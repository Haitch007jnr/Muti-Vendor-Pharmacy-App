import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import {
  Payroll,
  Payslip,
  PayrollStatus,
  PayslipStatus,
} from "./entities/payroll.entity";
import { CreatePayrollDto, PayslipItemDto } from "./dto/create-payroll.dto";
import { UpdatePayrollDto } from "./dto/update-payroll.dto";
import { GeneratePayslipDto } from "./dto/generate-payslip.dto";

@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(Payroll)
    private readonly payrollRepository: Repository<Payroll>,
    @InjectRepository(Payslip)
    private readonly payslipRepository: Repository<Payslip>,
    private readonly dataSource: DataSource,
  ) {}

  private generatePayrollNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `PAY-${timestamp}-${random}`;
  }

  private calculatePayslip(item: PayslipItemDto | GeneratePayslipDto): {
    grossSalary: number;
    totalDeductions: number;
    netSalary: number;
  } {
    const basicSalary = item.basicSalary || 0;
    const allowances = item.allowances || 0;
    const bonuses = item.bonuses || 0;
    const overtime = item.overtime || 0;

    const grossSalary = basicSalary + allowances + bonuses + overtime;

    // Calculate deductions
    let tax = 0;
    let pension = 0;

    if ("taxRate" in item && item.taxRate) {
      tax = (grossSalary * item.taxRate) / 100;
    } else if ("tax" in item) {
      tax = item.tax || 0;
    }

    if ("pensionRate" in item && item.pensionRate) {
      pension = (grossSalary * item.pensionRate) / 100;
    } else if ("pension" in item) {
      pension = item.pension || 0;
    }

    const healthInsurance = item.healthInsurance || 0;
    const otherDeductions = item.otherDeductions || 0;

    const totalDeductions = tax + pension + healthInsurance + otherDeductions;
    const netSalary = grossSalary - totalDeductions;

    return { grossSalary, totalDeductions, netSalary };
  }

  async create(
    createPayrollDto: CreatePayrollDto,
    userId: string,
  ): Promise<Payroll> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create payroll
      const payroll = this.payrollRepository.create({
        vendorId: createPayrollDto.vendorId,
        payrollNumber: this.generatePayrollNumber(),
        periodType: createPayrollDto.periodType,
        periodStart: createPayrollDto.periodStart,
        periodEnd: createPayrollDto.periodEnd,
        paymentDate: createPayrollDto.paymentDate,
        totalGross: 0,
        totalDeductions: 0,
        totalNet: 0,
        status: PayrollStatus.DRAFT,
        createdBy: userId,
        notes: createPayrollDto.notes,
      });

      const savedPayroll = await queryRunner.manager.save(payroll);

      // Create payslips
      let totalGross = 0;
      let totalDeductions = 0;
      let totalNet = 0;

      for (const item of createPayrollDto.payslips) {
        const calculations = this.calculatePayslip(item);

        const payslip = this.payslipRepository.create({
          payrollId: savedPayroll.id,
          employeeId: item.employeeId,
          basicSalary: item.basicSalary,
          allowances: item.allowances || 0,
          bonuses: item.bonuses || 0,
          overtime: item.overtime || 0,
          grossSalary: calculations.grossSalary,
          tax: item.tax || 0,
          pension: item.pension || 0,
          healthInsurance: item.healthInsurance || 0,
          otherDeductions: item.otherDeductions || 0,
          totalDeductions: calculations.totalDeductions,
          netSalary: calculations.netSalary,
          status: PayslipStatus.DRAFT,
          notes: item.notes,
        });

        await queryRunner.manager.save(payslip);

        totalGross += calculations.grossSalary;
        totalDeductions += calculations.totalDeductions;
        totalNet += calculations.netSalary;
      }

      // Update payroll totals
      savedPayroll.totalGross = totalGross;
      savedPayroll.totalDeductions = totalDeductions;
      savedPayroll.totalNet = totalNet;
      await queryRunner.manager.save(savedPayroll);

      await queryRunner.commitTransaction();

      // Return with relations
      return await this.findOne(savedPayroll.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(vendorId?: string, status?: PayrollStatus): Promise<Payroll[]> {
    const where: any = {};

    if (vendorId) {
      where.vendorId = vendorId;
    }

    if (status) {
      where.status = status;
    }

    return await this.payrollRepository.find({
      where,
      order: { createdAt: "DESC" },
      relations: ["payslips"],
    });
  }

  async findOne(id: string): Promise<Payroll> {
    const payroll = await this.payrollRepository.findOne({
      where: { id },
      relations: ["payslips"],
    });

    if (!payroll) {
      throw new NotFoundException(`Payroll with ID ${id} not found`);
    }

    return payroll;
  }

  async update(
    id: string,
    updatePayrollDto: UpdatePayrollDto,
  ): Promise<Payroll> {
    const payroll = await this.findOne(id);

    if (payroll.status === PayrollStatus.PAID) {
      throw new BadRequestException("Cannot update paid payroll");
    }

    Object.assign(payroll, updatePayrollDto);
    await this.payrollRepository.save(payroll);

    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const payroll = await this.findOne(id);

    if (payroll.status === PayrollStatus.PAID) {
      throw new BadRequestException("Cannot delete paid payroll");
    }

    await this.payrollRepository.remove(payroll);
  }

  async approvePayroll(id: string, userId: string): Promise<Payroll> {
    const payroll = await this.findOne(id);

    if (
      payroll.status !== PayrollStatus.DRAFT &&
      payroll.status !== PayrollStatus.PENDING
    ) {
      throw new BadRequestException("Payroll is not in draft or pending state");
    }

    payroll.status = PayrollStatus.APPROVED;
    payroll.approvedBy = userId;
    payroll.approvedAt = new Date();

    // Update all payslips to generated status
    await this.payslipRepository.update(
      { payrollId: id },
      { status: PayslipStatus.GENERATED },
    );

    await this.payrollRepository.save(payroll);
    return await this.findOne(id);
  }

  async markAsPaid(id: string): Promise<Payroll> {
    const payroll = await this.findOne(id);

    if (payroll.status !== PayrollStatus.APPROVED) {
      throw new BadRequestException(
        "Payroll must be approved before marking as paid",
      );
    }

    payroll.status = PayrollStatus.PAID;
    payroll.paidAt = new Date();

    // Update all payslips to paid status
    await this.payslipRepository.update(
      { payrollId: id },
      { status: PayslipStatus.PAID },
    );

    await this.payrollRepository.save(payroll);
    return await this.findOne(id);
  }

  async getPayslip(payslipId: string): Promise<Payslip> {
    const payslip = await this.payslipRepository.findOne({
      where: { id: payslipId },
      relations: ["payroll"],
    });

    if (!payslip) {
      throw new NotFoundException(`Payslip with ID ${payslipId} not found`);
    }

    return payslip;
  }

  async getEmployeePayslips(employeeId: string): Promise<Payslip[]> {
    return await this.payslipRepository.find({
      where: { employeeId },
      relations: ["payroll"],
      order: { createdAt: "DESC" },
    });
  }

  async getPayrollSummary(
    vendorId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalPayrolls: number;
    totalGross: number;
    totalDeductions: number;
    totalNet: number;
    totalEmployees: number;
  }> {
    const queryBuilder = this.payrollRepository
      .createQueryBuilder("payroll")
      .where("payroll.vendor_id = :vendorId", { vendorId });

    if (startDate && endDate) {
      queryBuilder.andWhere(
        "payroll.period_start BETWEEN :startDate AND :endDate",
        {
          startDate,
          endDate,
        },
      );
    }

    const summary = await queryBuilder
      .select("COUNT(payroll.id)", "totalPayrolls")
      .addSelect("SUM(payroll.total_gross)", "totalGross")
      .addSelect("SUM(payroll.total_deductions)", "totalDeductions")
      .addSelect("SUM(payroll.total_net)", "totalNet")
      .getRawOne();

    // Count unique employees
    const employeeCount = await this.payslipRepository
      .createQueryBuilder("payslip")
      .innerJoin("payslip.payroll", "payroll")
      .where("payroll.vendor_id = :vendorId", { vendorId })
      .select("COUNT(DISTINCT payslip.employee_id)", "count")
      .getRawOne();

    return {
      totalPayrolls: parseInt(summary?.totalPayrolls || "0", 10),
      totalGross: parseFloat(summary?.totalGross || "0"),
      totalDeductions: parseFloat(summary?.totalDeductions || "0"),
      totalNet: parseFloat(summary?.totalNet || "0"),
      totalEmployees: parseInt(employeeCount?.count || "0", 10),
    };
  }

  async generateSinglePayslip(
    payrollId: string,
    generatePayslipDto: GeneratePayslipDto,
  ): Promise<Payslip> {
    const payroll = await this.findOne(payrollId);

    if (payroll.status === PayrollStatus.PAID) {
      throw new BadRequestException("Cannot add payslip to paid payroll");
    }

    const calculations = this.calculatePayslip(generatePayslipDto);

    const payslip = this.payslipRepository.create({
      payrollId,
      employeeId: generatePayslipDto.employeeId,
      basicSalary: generatePayslipDto.basicSalary,
      allowances: generatePayslipDto.allowances || 0,
      bonuses: generatePayslipDto.bonuses || 0,
      overtime: generatePayslipDto.overtime || 0,
      grossSalary: calculations.grossSalary,
      tax: generatePayslipDto.taxRate
        ? (calculations.grossSalary * generatePayslipDto.taxRate) / 100
        : 0,
      pension: generatePayslipDto.pensionRate
        ? (calculations.grossSalary * generatePayslipDto.pensionRate) / 100
        : 0,
      healthInsurance: generatePayslipDto.healthInsurance || 0,
      otherDeductions: generatePayslipDto.otherDeductions || 0,
      totalDeductions: calculations.totalDeductions,
      netSalary: calculations.netSalary,
      paymentMethod: generatePayslipDto.paymentMethod,
      bankAccountId: generatePayslipDto.bankAccountId,
      status: PayslipStatus.DRAFT,
      notes: generatePayslipDto.notes,
    });

    const savedPayslip = await this.payslipRepository.save(payslip);

    // Update payroll totals
    payroll.totalGross += calculations.grossSalary;
    payroll.totalDeductions += calculations.totalDeductions;
    payroll.totalNet += calculations.netSalary;
    await this.payrollRepository.save(payroll);

    return savedPayslip;
  }
}
