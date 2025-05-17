import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import {
  LoggerService,
  TransactionStatus,
  TransactionType,
  CreateWalletDto,
  TransactionDto,
} from '@food-ordering-system/common';
import { TransactionManagementService } from '../transaction-management/transaction-management.service';

@Injectable()
export class WalletManagementService {
  constructor(
    private readonly logger: LoggerService,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    private connection: Connection,
    private transactionService: TransactionManagementService
  ) {
    this.logger.setContext(WalletManagementService.name);
  }

  async createWalletAsync(createWalletDto: CreateWalletDto): Promise<Wallet> {
    try {
      // Step 1: Check if wallet already exists for user
      const existingWallet = await this.walletRepository.findOne({
        where: { userId: createWalletDto.userId },
      });

      if (existingWallet) {
        throw new BadRequestException('User already has a wallet');
      }

      this.logger.log(
        `Creating wallet for user: ${createWalletDto.userId} with initial balance: ${createWalletDto.initialBalance}`
      );

      // Step 2: Create a new wallet
      const wallet = this.walletRepository.create({
        userId: createWalletDto.userId,
        balance: createWalletDto.initialBalance || 0,
      });

      if (wallet.balance < 0) {
        throw new BadRequestException('Initial balance cannot be negative');
      }

      this.logger.log(
        `New wallet created for user: ${createWalletDto.userId} with balance: ${wallet.balance}`
      );

      // Step 3: Save the wallet to the database
      return this.walletRepository.save(wallet);
    } catch (error) {
      this.logger.error(
        `Error creating wallet for user ${createWalletDto.userId}: ${error.message}`
      );
      throw new BadRequestException(
        `Failed to create wallet for user ${createWalletDto.userId}: ${error.message}`
      );
    }
  }

  async getWalletByUserIdAsync(userId: string): Promise<Wallet> {
    try {
      // Step 1: Check if wallet exists for user
      const wallet = await this.walletRepository.findOne({
        where: { userId, isActive: true },
      });

      if (!wallet) {
        throw new NotFoundException(`Wallet not found for user ${userId}`);
      }
      this.logger.log(
        `Wallet found for user: ${userId} with balance: ${wallet.balance}`
      );

      // Step 2: Return the wallet
      return wallet;
    } catch (error) {
      this.logger.error(
        `Error fetching wallet for user ${userId}: ${error.message}`
      );
      throw new NotFoundException(
        `Failed to fetch wallet for user ${userId}: ${error.message}`
      );
    }
  }

  async getWalletByIdAsync(id: string): Promise<Wallet> {
    try {
      // Step 1: Check if wallet exists by ID
      const wallet = await this.walletRepository.findOne({
        where: { id, isActive: true },
      });

      if (!wallet) {
        throw new NotFoundException(`Wallet with ID ${id} not found`);
      }

      this.logger.log(
        `Wallet found with ID: ${id} for user: ${wallet.userId} with balance: ${wallet.balance}`
      );

      // Step 2: Return the wallet
      return wallet;
    } catch (error) {
      this.logger.error(
        `Error fetching wallet with ID ${id}: ${error.message}`
      );
      throw new NotFoundException(
        `Failed to fetch wallet with ID ${id}: ${error.message}`
      );
    }
  }
  async getTransactionHistoryAsync(walletId: string) {
    try {
      // Step 1: Check if wallet exists
      const walletExists = await this.getWalletByIdAsync(walletId);
      if (!walletExists) {
        throw new NotFoundException(`Wallet with ID ${walletId} not found`);
      }

      this.logger.log(`Fetching transaction history for wallet: ${walletId}`);

      // Step 2: Use transaction service to fetch transaction history
      return this.transactionService.getTransactionHistoryAsync(walletId);
    } catch (error) {
      this.logger.error(
        `Error fetching transaction history for wallet ${walletId}: ${error.message}`
      );
      throw new NotFoundException(
        `Failed to fetch transaction history for wallet ${walletId}: ${error.message}`
      );
    }
  }
  async processTransactionAsync(transactionDto: TransactionDto) {
    try {
      const wallet = await this.getWalletByIdAsync(transactionDto.walletId);
      if (!wallet) {
        throw new NotFoundException(
          `Wallet with ID ${transactionDto.walletId} not found`
        );
      }

      this.logger.log(
        `Processing transaction for wallet: ${transactionDto.walletId} with amount: ${transactionDto.amount}`
      );

      let updatedBalance = wallet.balance;

      // Calculate new balance based on transaction type
      switch (transactionDto.type) {
        case TransactionType.DEPOSIT:
        case TransactionType.REFUND:
          updatedBalance += transactionDto.amount;
          break;
        case TransactionType.WITHDRAWAL:
        case TransactionType.PAYMENT:
          if (wallet.balance < transactionDto.amount) {
            this.logger.error('Insufficient funds');
            return { status: 'failed', message: 'Insufficient funds' };
          }
          updatedBalance -= transactionDto.amount;
          break;
      }

      // Update wallet balance
      await this.updateWalletBalanceAsync(
        wallet.id,
        transactionDto.type === TransactionType.DEPOSIT
          ? transactionDto.amount
          : -transactionDto.amount
      );

      // Create transaction record using transaction service
      const transaction = await this.transactionService.createTransactionAsync(
        transactionDto
      );

      this.logger.log(
        `Transaction processed for wallet: ${transactionDto.walletId} with new balance: ${updatedBalance}`
      );

      return { status: 'success', transaction };
    } catch (error) {
      this.logger.error(`Error processing transaction: ${error.message}`);
      throw error;
    }
  }

  async updateWalletBalanceAsync(
    walletId: string,
    amount: number
  ): Promise<Wallet> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get wallet
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { id: walletId, isActive: true },
      });

      if (!wallet) {
        throw new NotFoundException(`Wallet with ID ${walletId} not found`);
      }

      // Ensure balance is a number
      const currentBalance = typeof wallet.balance === 'string' 
        ? parseFloat(wallet.balance) 
        : wallet.balance;
      
      // Validate balance is not going negative
      const newBalance = currentBalance + amount;
      
      if (newBalance < 0) {
        throw new BadRequestException('Insufficient funds');
      }

      this.logger.log(
        `Updating wallet balance: ${walletId} from ${currentBalance} to ${newBalance}`
      );

      // Update balance
      wallet.balance = newBalance;

      // Save updated wallet
      await queryRunner.manager.save(wallet);
      await queryRunner.commitTransaction();

      this.logger.log(`Wallet balance updated successfully: ${walletId}`);
      return wallet;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error updating wallet balance: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async processPaymentAsync(
    senderWalletId: string,
    receiverWalletId: string,
    orderId: string,
    amount: number
  ): Promise<{ success: boolean }> {
    try {
      // Check if sender wallet exists and has sufficient balance
      const senderWallet = await this.getWalletByIdAsync(senderWalletId);
      if (senderWallet.balance < amount) {
        this.logger.error(
          `Insufficient funds in wallet ${senderWalletId} for payment`
        );
        return { success: false };
      }

      // Check if receiver wallet exists
      await this.getWalletByIdAsync(receiverWalletId);

      // Use transaction service to process the payment
      const result = await this.transactionService.processOrderPaymentAsync(
        senderWalletId,
        receiverWalletId,
        orderId,
        amount
      );

      if (result.success) {
        // Update wallet balances
        await this.updateWalletBalanceAsync(senderWalletId, -amount);
        await this.updateWalletBalanceAsync(receiverWalletId, amount);

        // Finalize transactions
        if (result.senderTransaction) {
          await this.transactionService.finalizeTransactionAsync(
            result.senderTransaction.id,
            TransactionStatus.COMPLETED
          );
        }

        if (result.receiverTransaction) {
          await this.transactionService.finalizeTransactionAsync(
            result.receiverTransaction.id,
            TransactionStatus.COMPLETED
          );
        }
      }

      return { success: result.success };
    } catch (error) {
      this.logger.error(`Error processing payment: ${error.message}`);
      return { success: false };
    }
  }
}
