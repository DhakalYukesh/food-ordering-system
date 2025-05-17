import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import {
  CheckAccess,
  CreateFoodItemDto,
  HasRole,
  LoggerService,
} from '@food-ordering-system/common';
import { FoodItemService } from './foodItem.service';

@Controller('restaurants/:restaurantId/food-items')
export class FoodItemController {
  constructor(
    private readonly logger: LoggerService,
    private readonly foodItemService: FoodItemService
  ) {
    this.logger.setContext(FoodItemController.name);
  }

  @Post()
  @CheckAccess([HasRole.RESTAURANT_OWNER, HasRole.ADMIN])
  createFoodItem(
    @Param('restaurantId') restaurantId: string,
    @Body() createFoodItemDto: CreateFoodItemDto
  ) {
    this.logger.log(
      `Creating food item with name: ${createFoodItemDto.name} for restaurant: ${restaurantId}`
    );

    return this.foodItemService.createFoodItemForARestaurantAsync(
      restaurantId,
      createFoodItemDto
    );
  }

  @Get()
  getFoodItems(@Param('restaurantId') restaurantId: string) {
    this.logger.log(`Fetching all food items for restaurant: ${restaurantId}`);

    return this.foodItemService.findAllFoodItemsForARestaurantAsync(
      restaurantId
    );
  }

  @Get(':id')
  getFoodItem(
    @Param('restaurantId') restaurantId: string,
    @Param('id') id: string
  ) {
    this.logger.log(
      `Fetching food item with id: ${id} for restaurant: ${restaurantId}`
    );

    return this.foodItemService.findOneFoodItemForARestaurantAsync(
      restaurantId,
      id
    );
  }

  @Put(':id')
  @CheckAccess([HasRole.RESTAURANT_OWNER, HasRole.ADMIN])
  updateFoodItem(
    @Param('restaurantId') restaurantId: string,
    @Param('id') id: string,
    @Body() updateFoodItemDto: Partial<CreateFoodItemDto>
  ) {
    this.logger.log(
      `Updating food item with id: ${id} for restaurant: ${restaurantId}`
    );

    return this.foodItemService.updateFoodItemForARestaurantAsync(
      restaurantId,
      id,
      updateFoodItemDto
    );
  }

  @Delete(':id')
  @CheckAccess([HasRole.RESTAURANT_OWNER, HasRole.ADMIN])
  removeFoodItem(
    @Param('restaurantId') restaurantId: string,
    @Param('id') id: string
  ) {
    this.logger.log(
      `Deleting food item with id: ${id} for restaurant: ${restaurantId}`
    );

    return this.foodItemService.removeFoodItemForARestaurantAsync(
      restaurantId,
      id
    );
  }
}
