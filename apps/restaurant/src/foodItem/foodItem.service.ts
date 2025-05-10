import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoodItem } from './entities/food-item.entity';
import { RestaurantManagementService } from '../restaurant-management/restaurant-management.service';
import { CreateFoodItemDto } from '@food-ordering-system/common';

@Injectable()
export class FoodItemService {
  constructor(
    @InjectRepository(FoodItem)
    private foodItemRepository: Repository<FoodItem>,
    private restaurantManagementService: RestaurantManagementService,
  ) {}

  async create(restaurantId: string, createFoodItemDto: CreateFoodItemDto): Promise<FoodItem> {
    // Verify restaurant exists
    const restaurant = await this.restaurantManagementService.findOneRestaurantAsync(restaurantId);
    
    const foodItem = this.foodItemRepository.create({
      ...createFoodItemDto,
      restaurant,
    });
    
    return this.foodItemRepository.save(foodItem);
  }

  async findAll(restaurantId: string): Promise<FoodItem[]> {
    // Verify restaurant exists
    await this.restaurantManagementService.findOneRestaurantAsync(restaurantId);
    
    return this.foodItemRepository.find({
      where: { restaurant: { id: restaurantId }, isAvailable: true },
    });
  }

  async findOne(restaurantId: string, id: string): Promise<FoodItem> {
    // Verify restaurant exists
    await this.restaurantManagementService.findOneRestaurantAsync(restaurantId);
    
    const foodItem = await this.foodItemRepository.findOne({
      where: { id, restaurant: { id: restaurantId }, isAvailable: true },
    });
    
    if (!foodItem) {
      throw new NotFoundException(`Food item with ID ${id} not found in restaurant ${restaurantId}`);
    }
    
    return foodItem;
  }

  async update(
    restaurantId: string,
    id: string,
    updateFoodItemDto: Partial<CreateFoodItemDto>,
  ): Promise<FoodItem> {
    const foodItem = await this.findOne(restaurantId, id);
    Object.assign(foodItem, updateFoodItemDto);
    return this.foodItemRepository.save(foodItem);
  }

  async remove(restaurantId: string, id: string): Promise<void> {
    const foodItem = await this.findOne(restaurantId, id);
    foodItem.isAvailable = false;
    await this.foodItemRepository.save(foodItem);
  }
}
