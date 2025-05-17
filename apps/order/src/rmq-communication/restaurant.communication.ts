import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { LoggerService, RMQServiceNames } from '@food-ordering-system/common';

@Injectable()
export class RestaurantCommunicate {
  constructor(
    @Inject(RMQServiceNames.RESTAURANT_SERVICE) private restaurantClient: ClientProxy,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(RestaurantCommunicate.name);
  }

  async getRestaurant(restaurantId: string) {
    try {
      this.logger.log(`Fetching restaurant with ID: ${restaurantId}`);
      return await firstValueFrom(
        this.restaurantClient.send('get_restaurant', { restaurantId })
      );
    } catch (error) {
      this.logger.error(`Error fetching restaurant: ${error.message}`);
      throw error;
    }
  }

  async getFoodItem(foodItemId: string) {
    try {
      this.logger.log(`Fetching food item with ID: ${foodItemId}`);
      return await firstValueFrom(
        this.restaurantClient.send('get_food_item', { foodItemId })
      );
    } catch (error) {
      this.logger.error(`Error fetching food item: ${error.message}`);
      throw error;
    }
  }
}