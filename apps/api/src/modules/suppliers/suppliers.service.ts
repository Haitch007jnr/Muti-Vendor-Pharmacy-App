import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async create(createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    const supplier = this.supplierRepository.create(createSupplierDto);
    return await this.supplierRepository.save(supplier);
  }

  async findAll(vendorId?: string, isActive?: boolean): Promise<Supplier[]> {
    const where: any = {};

    if (vendorId) {
      where.vendorId = vendorId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return await this.supplierRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({ where: { id } });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    return supplier;
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto): Promise<Supplier> {
    const supplier = await this.findOne(id);
    Object.assign(supplier, updateSupplierDto);
    return await this.supplierRepository.save(supplier);
  }

  async remove(id: string): Promise<void> {
    const supplier = await this.findOne(id);
    await this.supplierRepository.remove(supplier);
  }

  async importSuppliers(suppliers: CreateSupplierDto[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const supplierDto of suppliers) {
      try {
        await this.create(supplierDto);
        success++;
      } catch (error) {
        failed++;
      }
    }

    return { success, failed };
  }

  async exportSuppliers(vendorId: string): Promise<Supplier[]> {
    return await this.findAll(vendorId);
  }
}
