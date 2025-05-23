import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { LoggerService, PaymentMessagePatterns, RMQServiceNames } from '@food-ordering-system/common';

@Injectable()
export class WalletCommunicate {
  constructor(
    @Inject(RMQServiceNames.WALLET_SERVICE) private walletClient: ClientProxy,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(WalletCommunicate.name);
  }

  async getWalletByUserId(userId: string) {
    try {
      this.logger.log(`Fetching wallet for user: ${userId}`);
      return await firstValueFrom(
        this.walletClient.send('get_wallet_by_user_id', userId)
      );
    } catch (error) {
      this.logger.error(`Error fetching wallet: ${error.message}`);
      throw error;
    }
  }

  async processPayment(paymentData: {
    senderWalletId: string;
    receiverWalletId: string;
    orderId: string;
    amount: number;
  }) {
    try {
      this.logger.log(`Requesting payment processing for order: ${paymentData.orderId}`);
      this.walletClient.emit(PaymentMessagePatterns.PROCESS_ORDER_PAYMENT, paymentData);
      this.logger.log('Payment request emitted successfully');
    } catch (error) {
      this.logger.error(`Error emitting payment request: ${error.message}`);
      throw error;
    }
  }
}