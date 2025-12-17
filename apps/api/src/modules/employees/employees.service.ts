import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Employee } from "./entities/employee.entity";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    const employee = this.employeeRepository.create(createEmployeeDto);
    return await this.employeeRepository.save(employee);
  }

  async findAll(
    vendorId?: string,
    departmentId?: string,
    isActive?: boolean,
  ): Promise<Employee[]> {
    const where: any = {};

    if (vendorId) {
      where.vendorId = vendorId;
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return await this.employeeRepository.find({
      where,
      relations: ["department"],
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: ["department"],
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async findByUserId(userId: string): Promise<Employee | null> {
    return await this.employeeRepository.findOne({
      where: { userId },
      relations: ["department"],
    });
  }

  async update(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<Employee> {
    const employee = await this.findOne(id);
    Object.assign(employee, updateEmployeeDto);
    return await this.employeeRepository.save(employee);
  }

  async remove(id: string): Promise<void> {
    const employee = await this.findOne(id);
    await this.employeeRepository.remove(employee);
  }

  async getEmployeesByDepartment(departmentId: string): Promise<Employee[]> {
    return await this.employeeRepository.find({
      where: { departmentId, isActive: true },
      relations: ["department"],
    });
  }

  async countByVendor(vendorId: string): Promise<number> {
    return await this.employeeRepository.count({
      where: { vendorId, isActive: true },
    });
  }
}
