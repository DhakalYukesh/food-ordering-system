import { Controller, Inject, forwardRef } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { WalletManagementService } from '../wallet-management/wallet-management.service';
import {
  LoggerService,
  TransactionStatus,
  ProcessOrderPaymentDto,
} from '@food-ordering-system/common';
import { RmqService } from '@food-ordering-system/common';
import { OrderCommunicate } from './order.communicate';
import { TransactionManagementService } from '../transaction-management/transaction-management.service';

@Controller()
export class WalletPaymentEventController {
  constructor(
    @Inject(forwardRef(() => WalletManagementService))
    private readonly walletManagementService: WalletManagementService,
    @Inject(forwardRef(() => TransactionManagementService))
    private readonly transactionManagementService: TransactionManagementService,
    private readonly orderCommunicate: OrderCommunicate,
    private readonly rmqService: RmqService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(WalletPaymentEventController.name);
  }

  // Subscribe to the event for processing order payments
  // This event is emitted by the order service when a user places an order
  @EventPattern('process_order_payment')
  async handleOrderPayment(
    @Payload() paymentData: ProcessOrderPaymentDto,
    @Ctx() context: RmqContext
  ) {
    this.logger.log(
      `Event: Processing payment for order: ${paymentData.orderId}`
    );
    this.rmqService.acknowledgeMessage(context);

    try {
      // Get wallet information to check balance
      const senderWallet =
        await this.walletManagementService.getWalletByIdAsync(
          paymentData.senderWalletId
        );

      // Validate sufficient funds
      if (senderWallet.balance < paymentData.amount) {
        this.logger.error(
          `Payment failed for order: ${paymentData.orderId} - Insufficient funds`
        );
        await this.orderCommunicate.notifyPaymentStatus(
          paymentData.orderId,
          false
        );
        return;
      }

      // Process the payment using transaction management service
      const paymentResult =
        await this.transactionManagementService.processOrderPaymentAsync(
          paymentData.senderWalletId,
          paymentData.receiverWalletId,
          paymentData.orderId,
          paymentData.amount
        );

      if (paymentResult.success) {
        // Update wallet balances
        await this.walletManagementService.updateWalletBalanceAsync(
          paymentData.senderWalletId,
          -paymentData.amount
        );

        await this.walletManagementService.updateWalletBalanceAsync(
          paymentData.receiverWalletId,
          paymentData.amount
        );

        // Update transaction statuses to completed
        if (paymentResult.senderTransaction) {
          await this.transactionManagementService.finalizeTransactionAsync(
            paymentResult.senderTransaction.id,
            TransactionStatus.COMPLETED
          );
        }

        if (paymentResult.receiverTransaction) {
          await this.transactionManagementService.finalizeTransactionAsync(
            paymentResult.receiverTransaction.id,
            TransactionStatus.COMPLETED
          );
        }

        this.logger.log(
          `Payment processed successfully for order: ${paymentData.orderId}`
        );
        await this.orderCommunicate.notifyPaymentStatus(
          paymentData.orderId,
          true
        );
      } else {
        this.logger.error(
          `Payment processing failed for order: ${paymentData.orderId}`
        );
        await this.orderCommunicate.notifyPaymentStatus(
          paymentData.orderId,
          false
        );
      }
    } catch (error) {
      this.logger.error(
        `Error processing payment for order ${paymentData.orderId}: ${error.message}`
      );
      await this.orderCommunicate.notifyPaymentStatus(
        paymentData.orderId,
        false
      );
    }
  }
}
