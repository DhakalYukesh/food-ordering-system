import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  LoggerService,
  PaymentMessagePatterns,
  RMQServiceNames,
} from '@food-ordering-system/common';

@Injectable()
export class OrderCommunicate {
  constructor(
    private readonly logger: LoggerService,

    @Inject(RMQServiceNames.ORDER_SERVICE)
    private orderClient: ClientProxy
  ) {
    this.logger.setContext(OrderCommunicate.name);
  }

  // Emits a payment status event to the order service
  // This is used to notify the order service about the payment status
  async notifyPaymentStatus(orderId: string, success: boolean): Promise<void> {
    try {
      this.logger.log(
        `Emitting payment ${
          success ? 'success' : 'failure'
        } event for order: ${orderId}`
      );
      this.orderClient.emit(PaymentMessagePatterns.PAYMENT_COMPLETED, {
        orderId,
        success,
      });
      this.logger.log(`Payment status notification sent for order: ${orderId}`);
    } catch (error) {
      this.logger.error(
        `Error emitting payment status event: ${error.message}`
      );
      throw error;
    }
  }
}
