import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { OrderManagementService } from './order-management.service';
import {
  CheckAccess,
  CreateOrderDto,
  CurrentUser,
  HasRole,
  LoggerService,
  OrderMessagePatterns,
  OrderStatus,
  PaymentMessagePatterns,
} from '@food-ordering-system/common';

@Controller('orders')
export class OrderManagementController {
  constructor(
    private readonly logger: LoggerService,
    private readonly orderService: OrderManagementService
  ) {
    this.logger.setContext(OrderManagementController.name);
  }

  @Post()
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    this.logger.log(`Creating order for user ${createOrderDto.userId}`);

    return this.orderService.createOrderAsync(createOrderDto);
  }

  @Get()
  @CheckAccess()
  getCurrentUserOrderHistory(@CurrentUser('sub') userId: string) {
    this.logger.log(`Fetching order history for user ID ${userId}`);

    return this.orderService.getUserOrdersHistoryAsync(userId);
  }

  @Get(':id')
  getOrderHistory(@Param('id') orderId: string) {
    this.logger.log(`Fetching order history for order ID ${orderId}`);

    return this.orderService.getOrderHistoryAsync(orderId);
  }


  @Get('user/:userId')
  getUserOrdersHistory(@Param('userId') userId: string) {
    this.logger.log(`Fetching order history for user ID ${userId}`);

    return this.orderService.getUserOrdersHistoryAsync(userId);
  }

  // RPC endpoint to create an order
  // This endpoint is called by the user service when a user places an order
  @MessagePattern(OrderMessagePatterns.GET_ORDER)
  async handleGetOrder(@Payload() data: { orderId: string }) {
    try {
      this.logger.log(`RPC: Fetching order ${data.orderId}`);
      return await this.orderService.getOrderHistoryAsync(data.orderId);
    } catch (error) {
      this.logger.error(`RPC: Error fetching order: ${error.message}`);
      return { error: error.message };
    }
  }

  // Subscribe to payment_completed event
  // This event is emitted by the wallet service when a payment is completed
  @EventPattern(PaymentMessagePatterns.PAYMENT_COMPLETED)
  async handlePaymentCompleted(
    @Payload() data: { orderId: string; success: boolean }
  ) {
    try {
      this.logger.log(
        `Event: Payment ${data.success ? 'succeeded' : 'failed'} for order ${
          data.orderId
        }`
      );

      const newStatus = data.success
        ? OrderStatus.CONFIRMED
        : OrderStatus.CANCELLED;

      // Update order status in the database
      await this.orderService.updateOrderStatusAsync({
        orderId: data.orderId,
        status: newStatus,
      });

      this.logger.log(`Order ${data.orderId} status updated to ${newStatus}`);
    } catch (error) {
      this.logger.error(
        `Event: Error handling payment_completed: ${error.message}`
      );
    }
  }
}
