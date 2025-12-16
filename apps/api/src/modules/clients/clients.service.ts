import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Client } from './entities/client.entity';
import { ClientTransaction, TransactionType } from './entities/client-transaction.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(ClientTransaction)
    private readonly transactionRepository: Repository<ClientTransaction>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const client = this.clientRepository.create(createClientDto);
    return await this.clientRepository.save(client);
  }

  async findAll(vendorId?: string, isActive?: boolean): Promise<Client[]> {
    const where: any = {};

    if (vendorId) {
      where.vendorId = vendorId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return await this.clientRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { id },
      relations: ['transactions'],
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(id);
    Object.assign(client, updateClientDto);
    return await this.clientRepository.save(client);
  }

  async remove(id: string): Promise<void> {
    const client = await this.findOne(id);
    await this.clientRepository.remove(client);
  }

  async addTransaction(
    clientId: string,
    createTransactionDto: CreateTransactionDto,
    userId: string,
  ): Promise<ClientTransaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const client = await queryRunner.manager.findOne(Client, {
        where: { id: clientId },
      });

      if (!client) {
        throw new NotFoundException(`Client with ID ${clientId} not found`);
      }

      const { type, amount, description, reference } = createTransactionDto;

      let newBalance: number;
      if (type === TransactionType.DEBIT) {
        newBalance = Number(client.balance) + Number(amount);
      } else {
        newBalance = Number(client.balance) - Number(amount);
      }

      if (newBalance < 0) {
        throw new BadRequestException('Insufficient balance for this transaction');
      }

      const transaction = this.transactionRepository.create({
        clientId,
        type,
        amount,
        balanceAfter: newBalance,
        description,
        reference,
        createdBy: userId,
      });

      await queryRunner.manager.save(transaction);

      client.balance = newBalance;
      await queryRunner.manager.save(client);

      await queryRunner.commitTransaction();
      return transaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getTransactions(clientId: string, limit = 10, offset = 0): Promise<ClientTransaction[]> {
    await this.findOne(clientId); // Check if client exists

    return await this.transactionRepository.find({
      where: { clientId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async getClientBalance(clientId: string): Promise<number> {
    const client = await this.findOne(clientId);
    return Number(client.balance);
  }

  async importClients(clients: CreateClientDto[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const clientDto of clients) {
      try {
        await this.create(clientDto);
        success++;
      } catch (error) {
        failed++;
      }
    }

    return { success, failed };
  }

  async exportClients(vendorId: string): Promise<Client[]> {
    return await this.findAll(vendorId);
  }
}
