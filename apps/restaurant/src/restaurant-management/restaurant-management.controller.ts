import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import {
  CheckAccess,
  CreateRestaurantDto,
  CurrentUser,
  HasRole,
  LoggerService,
  RestaurantMessagePatterns,
} from '@food-ordering-system/common';
import { RestaurantManagementService } from './restaurant-management.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FoodItemService } from '../foodItem/foodItem.service';

@Controller('restaurants')
export class RestaurantManagementController {
  constructor(
    private readonly logger: LoggerService,
    private readonly restaurantManagementService: RestaurantManagementService,
    private readonly foodItemService: FoodItemService
  ) {
    this.logger.setContext(RestaurantManagementController.name);
  }

  @Post()
  @CheckAccess([HasRole.RESTAURANT_OWNER, HasRole.ADMIN])
  createRestaurant(
    @CurrentUser('sub') ownerId: string,
    @Body() createRestaurantDto: CreateRestaurantDto
  ) {
    this.logger.log(
      `Creating restaurant with name: ${createRestaurantDto.name}`
    );

    return this.restaurantManagementService.createRestaurantAsync(
      ownerId,
      createRestaurantDto
    );
  }

  @Get()
  async getRestaurants() {
    this.logger.log('Fetching all restaurants');
    return this.restaurantManagementService.getRestaurantsAsync();
  }

  @Get('search')
  async searchByFoodItem(@Query('foodItem') foodItem: string) {
    this.logger.log(`Searching restaurants with food item: ${foodItem}`);
    return this.restaurantManagementService.searchByFoodItemAsync(foodItem);
  }

  @Get('foods/search')
  async searchFoods(@Query('name') name: string) {
    this.logger.log(`Searching for food items with name: ${name}`);
    return this.restaurantManagementService.searchFoodsAsync(name);
  }

  @Get(':id')
  async getRestaurantById(@Param('id') id: string) {
    this.logger.log(`Fetching restaurant with id: ${id}`);
    return this.restaurantManagementService.getRestaurantByIdAsync(id);
  }

  @Put(':id')
  @CheckAccess([HasRole.RESTAURANT_OWNER, HasRole.ADMIN])
  async updateRestaurant(
    @Param('id') id: string,
    @Body() updateRestaurantDto: Partial<CreateRestaurantDto>
  ) {
    this.logger.log(
      `Updating restaurant with id: ${id} and name: ${updateRestaurantDto.name}`
    );

    return this.restaurantManagementService.updateRestaurantAsync(
      id,
      updateRestaurantDto
    );
  }

  @Delete(':id')
  @CheckAccess([HasRole.RESTAURANT_OWNER, HasRole.ADMIN])
  async removeRestaurant(@Param('id') id: string) {
    this.logger.log(`Deleting restaurant with id: ${id}`);

    return this.restaurantManagementService.removeRestaurantAsync(id);
  }

  // RPC endpoint to get restaurant
  // This endpoint is called by the order service when a user places an order
  @MessagePattern(RestaurantMessagePatterns.GET_RESTAURANT)
  async handleGetRestaurant(@Payload() data: { id: string }) {
    try {
      this.logger.log(`RPC: Fetching restaurant with id: ${data.id}`);
      const responseData = await this.restaurantManagementService.getRestaurantByIdAsync(
        data.id
      );

      return responseData.data;
    } catch (error) {
      this.logger.error(`RPC: Error fetching restaurant: ${error.message}`);
      return null;
    }
  }

  // RPC endpoint to get food item
  // This endpoint is called by the order service when a user places an order
  @MessagePattern(RestaurantMessagePatterns.GET_FOOD_ITEM)
  async handleGetFoodItem(@Payload() data: { id: string }) {
    try {
      this.logger.log(`RPC: Fetching food item with id: ${data.id}`);

      const foodItem = await this.foodItemService.findFoodItemById(data.id);

      return foodItem;
    } catch (error) {
      this.logger.error(`RPC: Error fetching food item: ${error.message}`);
      return null;
    }
  }
}
