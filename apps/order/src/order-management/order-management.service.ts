import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { RestaurantCommunicate } from '../rmq-communication/restaurant.communication';
import { UserCommunicate } from '../rmq-communication/user.communication';
import { WalletCommunicate } from '../rmq-communication/wallet.communication';
import { CreateOrderDto, OrderStatus, OrderStatusDto, PaymentDto } from '@food-ordering-system/common';

@Injectable()
export class OrderManagementService {
  private readonly logger = new Logger(OrderManagementService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private userCommunicate: UserCommunicate,
    private restaurantCommunicate: RestaurantCommunicate,
    private walletCommunicate: WalletCommunicate
  ) {}

  async createOrderAsync(createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      // 1. Validate user exists - RPC call (synchronous)
      const user = await this.userCommunicate.getUser(createOrderDto.userId);

      if (!user) {
        throw new NotFoundException(
          `User with ID ${createOrderDto.userId} not found`
        );
      }

      this.logger.log(`Creating order for user with data: ${user}`);

      // 2. Validate restaurant exists - RPC call (synchronous)
      const restaurantResponse = await this.restaurantCommunicate.getRestaurant(
        createOrderDto.restaurantId
      );

      if (!restaurantResponse || !restaurantResponse.data) {
        throw new NotFoundException(
          `Restaurant with ID ${createOrderDto.restaurantId} not found`
        );
      }

      const restaurant = restaurantResponse.data;
      this.logger.log(`Restaurant found: ${JSON.stringify(restaurant)}`);
      
      // Check if restaurant owner ID exists
      if (!restaurant.ownerId) {
        throw new NotFoundException(
          `Restaurant with ID ${createOrderDto.restaurantId} has no owner assigned`
        );
      }

      // 3. Validate food items and calculate total - RPC calls (synchronous)
      let totalAmount = 0;
      const orderItems = [];

      for (const item of createOrderDto.items) {
        const foodItemResponse = await this.restaurantCommunicate.getFoodItem(
          item.foodItemId
        );

        this.logger.log(`Food item response: ${JSON.stringify(foodItemResponse)}`);
        
        // Handle different possible response structures
        let foodItem;
        if (foodItemResponse) {
          if (foodItemResponse.data) {
            // Response has data property
            foodItem = foodItemResponse.data;
          } else if (foodItemResponse.id) {
            // Response is the food item directly
            foodItem = foodItemResponse;
          } else {
            // Try to find the object structure
            this.logger.log("Complex response structure, attempting to extract food item");
            foodItem = this.extractFoodItem(foodItemResponse);
          }
        }

        if (!foodItem || !foodItem.id) {
          throw new NotFoundException(
            `Food item with ID ${item.foodItemId} not found or has invalid format`
          );
        }

        this.logger.log(`Food item extracted: ${JSON.stringify(foodItem)}`);

        // Make sure price is a number
        const price = typeof foodItem.price === 'string' ? 
          parseFloat(foodItem.price) : foodItem.price;
          
        const subtotal = price * item.quantity;
        totalAmount += subtotal;

        orderItems.push({
          foodItemId: foodItem.id,
          name: foodItem.name,
          price: price,
          quantity: item.quantity,
          subtotal,
        });
      }

      // 4. Create order
      const order = this.orderRepository.create({
        userId: createOrderDto.userId,
        restaurantId: createOrderDto.restaurantId,
        restaurantOwnerId: restaurant.ownerId,
        items: orderItems,
        totalAmount,
        status: OrderStatus.CREATED,
      });

      const savedOrder = await this.orderRepository.save(order);
      this.logger.log(`Order created with ID: ${savedOrder.id}`);

      // 5. Process payment asynchronously (pub/sub pattern)
      this.processPayment(savedOrder);

      return savedOrder;
    } catch (error) {
      this.logger.error(`Error creating order: ${error.message}`);
      throw error;
    }
  }

  // This method uses pub/sub pattern for asynchronous communication
  private async processPayment(order: Order): Promise<void> {
    try {
      // Get customer wallet - RPC call (synchronous)
      const customerWallet = await this.walletCommunicate.getWalletByUserId(
        order.userId
      );

      if (!customerWallet) {
        await this.updateOrderStatusAsync({
          orderId: order.id,
          status: OrderStatus.CANCELLED,
        });
        this.logger.error(`Customer wallet not found for user ${order.userId}`);
        return;
      }

      // Get restaurant owner wallet - RPC call (synchronous)
      const ownerWallet = await this.walletCommunicate.getWalletByUserId(
        order.restaurantOwnerId
      );

      if (!ownerWallet) {
        await this.updateOrderStatusAsync({
          orderId: order.id,
          status: OrderStatus.CANCELLED,
        });
        this.logger.error(
          `Restaurant owner wallet not found for user ${order.restaurantOwnerId}`
        );
        return;
      }

      // Prepare payment data
      const paymentData: PaymentDto = {
        senderWalletId: customerWallet.id,
        receiverWalletId: ownerWallet.id,
        orderId: order.id,
        amount: order.totalAmount,
      };

      // Publish payment request event (pub/sub pattern)
      await this.walletCommunicate.processPayment(paymentData);
      this.logger.log(`Payment request published for order ${order.id}`);
    } catch (error) {
      this.logger.error(`Error processing payment: ${error.message}`);
      await this.updateOrderStatusAsync({
        orderId: order.id,
        status: OrderStatus.CANCELLED,
      });
    }
  }

  async getOrderHistoryAsync(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return order;
  }

  async getUserOrdersHistoryAsync(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateOrderStatusAsync(orderStatusDto: OrderStatusDto): Promise<Order> {
    const order = await this.getOrderHistoryAsync(orderStatusDto.orderId);

    order.status = orderStatusDto.status;
    const updatedOrder = await this.orderRepository.save(order);

    return updatedOrder;
  }

  // Update order with payment ID
  async updateOrderPaymentAsync(orderId: string, paymentId: string): Promise<Order> {
    const order = await this.getOrderHistoryAsync(orderId);
    
    order.paymentId = paymentId;
    order.status = OrderStatus.CONFIRMED;
    
    this.logger.log(`Updating order ${orderId} with payment ID: ${paymentId}`);
    const updatedOrder = await this.orderRepository.save(order);
    
    return updatedOrder;
  }

  // Helper method to extract food item from complex responses
  private extractFoodItem(response) {
    // Try to find an object with expected food item properties
    if (typeof response !== 'object' || !response) {
      return null;
    }
    
    // If the response itself has food item properties, return it
    if (response.id && response.name && (response.price !== undefined)) {
      return response;
    }
    
    // Check if any property of the response is a food item
    for (const key in response) {
      const value = response[key];
      if (typeof value === 'object' && value && value.id && value.name && (value.price !== undefined)) {
        return value;
      }
    }
    
    return null;
  }
}
