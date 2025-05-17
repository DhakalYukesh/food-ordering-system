import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import {
  LoggerService,
  TransactionStatus,
  TransactionType,
  TransactionDto,
} from '@food-ordering-system/common';
import { OrderCommunicate } from '../rmq-communication/order.communicate';

@Injectable()
export class TransactionManagementService {
  constructor(
    private readonly logger: LoggerService,
    private connection: Connection,
    
    @Inject(forwardRef(() => OrderCommunicate))
    private orderCommunicate: OrderCommunicate,

    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>
  ) {
    this.logger.setContext(TransactionManagementService.name);
  }

  async getTransactionHistoryAsync(walletId: string): Promise<Transaction[]> {
    try {
      this.logger.log(`Fetching transaction history for wallet: ${walletId}`);

      // Fetch transaction history
      const transactions = await this.transactionRepository.find({
        where: { walletId },
        order: { createdAt: 'DESC' },
      });

      if (!transactions || transactions.length === 0) {
        throw new NotFoundException(
          `No transactions found for wallet ${walletId}`
        );
      }

      this.logger.log(
        `Transaction history fetched for wallet: ${walletId} with ${transactions.length} transactions`
      );

      return transactions;
    } catch (error) {
      this.logger.error(
        `Error fetching transaction history for wallet ${walletId}: ${error.message}`
      );
      throw new NotFoundException(
        `Failed to fetch transaction history for wallet ${walletId}: ${error.message}`
      );
    }
  }

  async createTransactionAsync(
    createTransactionDto: TransactionDto
  ): Promise<Transaction> {
    try {
      this.logger.log(
        `Creating transaction record for wallet: ${createTransactionDto.walletId} with amount: ${createTransactionDto.amount}`
      );

      const transaction = this.transactionRepository.create({
        ...createTransactionDto,
        status: TransactionStatus.COMPLETED,
      });

      return this.transactionRepository.save(transaction);
    } catch (error) {
      this.logger.error(`Error creating transaction: ${error.message}`);
      throw new BadRequestException(
        `Failed to create transaction: ${error.message}`
      );
    }
  }

  async processOrderPaymentAsync(
    senderWalletId: string,
    receiverWalletId: string,
    orderId: string,
    amount: number
  ): Promise<{
    success: boolean;
    senderTransaction?: Transaction;
    receiverTransaction?: Transaction;
  }> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create sender transaction (payment)
      const senderTransaction = queryRunner.manager.create(Transaction, {
        walletId: senderWalletId,
        amount: amount,
        type: TransactionType.PAYMENT,
        orderId: orderId,
        description: `Payment for order ${orderId}`,
        status: TransactionStatus.PENDING,
      });

      // Create receiver transaction (deposit)
      const receiverTransaction = queryRunner.manager.create(Transaction, {
        walletId: receiverWalletId,
        amount: amount,
        type: TransactionType.DEPOSIT,
        orderId: orderId,
        description: `Payment received for order ${orderId}`,
        status: TransactionStatus.PENDING,
      });

      // Save both transactions with pending status
      await queryRunner.manager.save(senderTransaction);
      await queryRunner.manager.save(receiverTransaction);

      await queryRunner.commitTransaction();

      this.logger.log(`Payment transactions created for order ${orderId}`);
      return {
        success: true,
        senderTransaction,
        receiverTransaction,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error creating payment transactions: ${error.message}`
      );

      // Notify order service about payment failure
      await this.orderCommunicate.notifyPaymentStatus(orderId, false);

      return { success: false };
    } finally {
      await queryRunner.release();
    }
  }

  async finalizeTransactionAsync(
    transactionId: string,
    status: TransactionStatus
  ): Promise<Transaction> {
    try {
      const transaction = await this.transactionRepository.findOne({
        where: { id: transactionId },
      });

      if (!transaction) {
        throw new NotFoundException(
          `Transaction not found with ID ${transactionId}`
        );
      }

      transaction.status = status;
      return this.transactionRepository.save(transaction);
    } catch (error) {
      this.logger.error(`Error finalizing transaction: ${error.message}`);
      throw error;
    }
  }
}
