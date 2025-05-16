import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';
import { CreateWalletDto, TransactionDto, TransactionStatus, TransactionType } from '@food-ordering-system/common';


@Injectable()
export class WalletManagementService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private connection: Connection
  ) {}

  async createWallet(createWalletDto: CreateWalletDto): Promise<Wallet> {
    // Check if wallet already exists for user
    const existingWallet = await this.walletRepository.findOne({
      where: { userId: createWalletDto.userId }
    });

    if (existingWallet) {
      throw new BadRequestException('User already has a wallet');
    }

    const wallet = this.walletRepository.create({
      userId: createWalletDto.userId,
      balance: createWalletDto.initialBalance || 0,
    });

    return this.walletRepository.save(wallet);
  }

  async getWalletByUserId(userId: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { userId, isActive: true }
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet not found for user ${userId}`);
    }

    return wallet;
  }

  async getWalletById(id: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { id, isActive: true }
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${id} not found`);
    }

    return wallet;
  }

  async getTransactionHistory(walletId: string): Promise<Transaction[]> {
    await this.getWalletById(walletId); // Verify wallet exists

    return this.transactionRepository.find({
      where: { walletId },
      order: { createdAt: 'DESC' }
    });
  }

  async processTransaction(transactionDto: TransactionDto): Promise<Transaction> {
    // Use a transaction to ensure data consistency
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await this.getWalletById(transactionDto.walletId);
      
      let updatedBalance = wallet.balance;
      let transactionStatus = TransactionStatus.COMPLETED;
      
      // Calculate new balance based on transaction type
      switch (transactionDto.type) {
        case TransactionType.DEPOSIT:
        case TransactionType.REFUND:
          updatedBalance += transactionDto.amount;
          break;
        case TransactionType.WITHDRAWAL:
        case TransactionType.PAYMENT:
          if (wallet.balance < transactionDto.amount) {
            transactionStatus = TransactionStatus.FAILED;
            throw new BadRequestException('Insufficient funds');
          }
          updatedBalance -= transactionDto.amount;
          break;
      }

      // Create transaction record
      const transaction = this.transactionRepository.create({
        ...transactionDto,
        status: transactionStatus,
      });

      // Update wallet balance
      wallet.balance = updatedBalance;
      
      await queryRunner.manager.save(transaction);
      await queryRunner.manager.save(wallet);
      
      await queryRunner.commitTransaction();
      
      return transaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
