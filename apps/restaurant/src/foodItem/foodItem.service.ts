import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { FoodItem } from './entities/food-item.entity';
import { RestaurantManagementService } from '../restaurant-management/restaurant-management.service';
import {
  CreateFoodItemDto,
  LoggerService,
  SuccessResponse,
} from '@food-ordering-system/common';

@Injectable()
export class FoodItemService {
  constructor(
    private readonly logger: LoggerService,

    @InjectRepository(FoodItem)
    private foodItemRepository: Repository<FoodItem>,
    private restaurantManagementService: RestaurantManagementService
  ) {
    this.logger.setContext(FoodItemService.name);
  }

  async createFoodItemForARestaurantAsync(
    restaurantId: string,
    createFoodItemDto: CreateFoodItemDto
  ): Promise<SuccessResponse<FoodItem>> {
    try {
      // Step 1: Verify restaurant exists
      const restaurantExistsResp =
        await this.restaurantManagementService.findOneRestaurantAsync(
          restaurantId
        );

      if (!restaurantExistsResp) {
        throw new NotFoundException(
          `Restaurant with ID ${restaurantId} not found`
        );
      }

      this.logger.log(
        `Creating food item with name: ${createFoodItemDto.name} for restaurant: ${restaurantId}`
      );

      // Step 2: Create food item
      const foodItem = this.foodItemRepository.create({
        ...createFoodItemDto,
        restaurant: restaurantExistsResp.data,
      });
      const savedFoodItemResp = await this.foodItemRepository.save(foodItem);

      if (!savedFoodItemResp) {
        throw new NotFoundException(
          `Food item with ID ${foodItem.id} not found`
        );
      }

      this.logger.log(`Food item created successfully with ID: ${foodItem.id}`);

      // Step 3: Save food item
      return {
        statusCode: 201,
        message: 'Food item created successfully',
        data: savedFoodItemResp,
      };
    } catch (error) {
      this.logger.error(
        `Failed to create food item for restaurant ${restaurantId}: ${error.message}`
      );
      throw new NotFoundException(
        `Failed to create food item for restaurant ${restaurantId}: ${error.message}`
      );
    }
  }

  async findAllFoodItemsForARestaurantAsync(
    restaurantId: string
  ): Promise<SuccessResponse<FoodItem[]>> {
    try {
      // Step 1: Verify restaurant exists
      const restaurantExistsResp =
        await this.restaurantManagementService.findOneRestaurantAsync(
          restaurantId
        );

      if (!restaurantExistsResp) {
        throw new NotFoundException(
          `Restaurant with ID ${restaurantId} not found`
        );
      }

      this.logger.log(
        `Fetching all food items for restaurant: ${restaurantId}`
      );

      // Step 2: Fetch food items
      const restaurantFoodItemsResp = await this.foodItemRepository.find({
        where: { restaurant: { id: restaurantId }, isAvailable: true },
      });

      if (!restaurantFoodItemsResp) {
        throw new NotFoundException(
          `No food items found for restaurant ${restaurantId}`
        );
      }

      this.logger.log(
        `Found ${restaurantFoodItemsResp.length} food items for restaurant: ${restaurantId}`
      );

      // Step 3: Return food items
      return {
        statusCode: 200,
        message: 'Food items retrieved successfully',
        data: restaurantFoodItemsResp,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch food items for restaurant ${restaurantId}: ${error.message}`
      );
      throw new NotFoundException(
        `Failed to fetch food items for restaurant ${restaurantId}: ${error.message}`
      );
    }
  }

  async findOneFoodItemForARestaurantAsync(
    restaurantId: string,
    id?: string,
    name?: string
  ): Promise<SuccessResponse<FoodItem | FoodItem[]>> {
    try {
      // Step 1: Verify restaurant exists
      const restaurantExistsResp =
        await this.restaurantManagementService.findOneRestaurantAsync(restaurantId);

      if (!restaurantExistsResp) {
        throw new NotFoundException(
          `Restaurant with ID ${restaurantId} not found`
        );
      }

      this.logger.log(
        `Fetching food item for restaurant: ${restaurantId}, name: ${name}, id: ${id}`
      );

      // Step 2: Fetch food item
      if (id) {
        this.logger.log(
          `Searching for food item by ID: ${id} in restaurant: ${restaurantId}`
        );

        const foodItem = await this.foodItemRepository.findOne({
          where: { id, restaurant: { id: restaurantId }, isAvailable: true },
        });

        if (!foodItem) {
          throw new NotFoundException(
            `Food item with ID ${id} not found in restaurant ${restaurantId}`
          );
        }

        this.logger.log(
          `Found food item in restaurant: ${restaurantId}`
        );

        return {
          statusCode: 200,
          message: 'Food item retrieved successfully',
          data: foodItem,
        };
      } else if (name) {
        this.logger.log(
          `Searching for food items by name: ${name} in restaurant: ${restaurantId}`
        );

        const foodItems = await this.foodItemRepository.find({
          where: { name: ILike(`%${name}%`), restaurant: { id: restaurantId }, isAvailable: true },
        });

        if (!foodItems || foodItems.length === 0) {
          throw new NotFoundException(
            `No food items matching '${name}' found in restaurant ${restaurantId}`
          );
        }

        this.logger.log(
          `Found ${foodItems.length} food items matching '${name}' in restaurant: ${restaurantId}`
        );

        return {
          statusCode: 200,
          message: 'Food items retrieved successfully',
          data: foodItems,
        };
      } else {
        throw new BadRequestException('Either id or name must be provided');
      }
    } catch (error) {
      this.logger.error(
        `Failed to fetch food item for restaurant ${restaurantId}: ${error.message}`
      );
      throw error;
    }
  }

  async updateFoodItemForARestaurantAsync(
    restaurantId: string,
    id: string,
    updateFoodItemDto: Partial<CreateFoodItemDto>
  ): Promise<SuccessResponse<FoodItem>> {
    try {
      // Step 1: Verify restaurant exists and then fetch food item
      const foodItemResponse = await this.findOneFoodItemForARestaurantAsync(
        restaurantId,
        id
      );
      const foodItem = foodItemResponse.data as FoodItem;
      Object.assign(foodItem, updateFoodItemDto);
      const updatedFoodItemResp = await this.foodItemRepository.save(foodItem);

      if (!updatedFoodItemResp) {
        throw new NotFoundException(
          `Food item with ID ${id} not found in restaurant ${restaurantId}`
        );
      }

      this.logger.log(
        `Food item updated successfully with ID: ${id} for restaurant: ${restaurantId}`
      );

      // Step 2: Return updated food item
      return {
        statusCode: 200,
        message: 'Food item updated successfully',
        data: updatedFoodItemResp,
      };
    } catch (error) {
      this.logger.error(
        `Failed to update food item with ID ${id} for restaurant ${restaurantId}: ${error.message}`
      );
      throw new NotFoundException(
        `Failed to update food item with ID ${id} for restaurant ${restaurantId}: ${error.message}`
      );
    }
  }

  async removeFoodItemForARestaurantAsync(
    restaurantId: string,
    id: string
  ): Promise<SuccessResponse<void>> {
    try {
      // Step 1: Verify restaurant exists and then fetch food item
      const foodItemResponse = await this.findOneFoodItemForARestaurantAsync(
        restaurantId,
        id
      );
      const foodItem = foodItemResponse.data as FoodItem;
      foodItem.isAvailable = false;
      const removedFoodItemResp = await this.foodItemRepository.save(foodItem);

      if (!removedFoodItemResp) {
        throw new NotFoundException(
          `Food item with ID ${id} not found in restaurant ${restaurantId}`
        );
      }

      this.logger.log(
        `Food item removed successfully with ID: ${id} for restaurant: ${restaurantId}`
      );

      // Step 2: Return success response
      return {
        statusCode: 200,
        message: 'Food item removed successfully',
        data: undefined,
      };
    } catch (error) {
      this.logger.error(
        `Failed to remove food item with ID ${id} for restaurant ${restaurantId}: ${error.message}`
      );
      throw new NotFoundException(
        `Failed to remove food item with ID ${id} for restaurant ${restaurantId}: ${error.message}`
      );
    }
  }
}
