import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { Repository } from 'typeorm';
import {
  CreateRestaurantDto,
  LoggerService,
  SuccessResponse,
} from '@food-ordering-system/common';

@Injectable()
export class RestaurantManagementService {
  constructor(
    private readonly logger: LoggerService,

    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>
  ) {
    this.logger.setContext(RestaurantManagementService.name);
  }

  async createRestaurantAsync(
    ownerId: string,
    createRestaurantDto: CreateRestaurantDto
  ): Promise<SuccessResponse<Restaurant>> {
    try {
      // Step 1: Check if the restaurant already exists
      const existingRestaurant = await this.restaurantRepository.findOne({
        where: { name: createRestaurantDto.name, isActive: true },
      });

      if (existingRestaurant) {
        this.logger.warn('Restaurant already exists');
        throw new NotFoundException('Restaurant already exists');
      }

      // Step 2: Create and save the new restaurant
      const restaurantData = {
        ...createRestaurantDto,
        ownerId,
      };

      this.logger.log(
        `Creating restaurant with name: ${createRestaurantDto.name}`
      );

      const restaurant = this.restaurantRepository.create(restaurantData);
      const savedRestaurant = await this.restaurantRepository.save(restaurant);

      if (!savedRestaurant) {
        this.logger.error('Failed to create restaurant');
        throw new NotFoundException('Failed to create restaurant');
      }

      this.logger.log(
        `Restaurant created successfully with ID: ${savedRestaurant.id}`
      );

      // Step 3: Return the created restaurant
      return {
        statusCode: 201,
        message: 'Restaurant created successfully',
        data: savedRestaurant,
      };
    } catch (error) {
      this.logger.error(
        `Error creating restaurant: ${error.message}`,
        error.stack
      );
      throw new NotFoundException(
        `Error creating restaurant: ${error.message}`
      );
    }
  }

  async findAllRestaurantsAsync(): Promise<SuccessResponse<Restaurant[]>> {
    try {
      this.logger.log('Fetching all active restaurants');

      // Step 1: Query the database for active restaurants
      const restaurants = await this.restaurantRepository.find({
        where: { isActive: true },
      });

      this.logger.log(`Found ${restaurants.length} active restaurants`);

      // Step 2: Return the restaurant list with success response
      return {
        statusCode: 200,
        message: 'Restaurants retrieved successfully',
        data: restaurants,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching all restaurants: ${error.message}`,
        error.stack
      );
      throw new NotFoundException(
        `Error fetching all restaurants: ${error.message}`
      );
    }
  }

  async findOneRestaurantAsync(
    id: string
  ): Promise<SuccessResponse<Restaurant>> {
    try {
      this.logger.log(`Fetching restaurant with id: ${id}`);

      // Step 1: Fetch restaurant with its associated food items
      const restaurant = await this.restaurantRepository.findOne({
        where: { id },
        relations: ['foodItems'],
      });

      if (!restaurant) {
        throw new NotFoundException(`Restaurant with ID ${id} not found`);
      }

      // Step 2: Filter out unavailable food items
      if (restaurant.foodItems) {
        restaurant.foodItems = restaurant.foodItems.filter(
          (item) => item.isAvailable
        );
      }

      this.logger.log(`Restaurant ${restaurant.name} fetched successfully`);

      return {
        statusCode: 200,
        message: 'Restaurant fetched successfully',
        data: restaurant,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch restaurant with ID ${id}: ${error.message}`
      );
      throw error;
    }
  }

  async updateRestaurantAsync(
    id: string,
    updateRestaurantDto: Partial<CreateRestaurantDto>
  ): Promise<SuccessResponse<Restaurant>> {
    try {
      this.logger.log(`Updating restaurant with ID: ${id}`);

      // Step 1: Find the restaurant to update
      const restaurantResponse = await this.findOneRestaurantAsync(id);
      const restaurant = restaurantResponse.data;

      Object.assign(restaurant, updateRestaurantDto);

      const updatedRestaurant = await this.restaurantRepository.save(
        restaurant
      );

      this.logger.log(
        `Restaurant updated successfully: ${updatedRestaurant.name}`
      );

      // Step 2: Return the updated restaurant with success response
      return {
        statusCode: 200,
        message: 'Restaurant updated successfully',
        data: updatedRestaurant,
      };
    } catch (error) {
      this.logger.error(
        `Error updating restaurant with ID ${id}: ${error.message}`,
        error.stack
      );
      throw new NotFoundException(
        `Error updating restaurant with ID ${id}: ${error.message}`
      );
    }
  }

  async deleteRestaurantAsync(id: string): Promise<SuccessResponse<null>> {
    try {
      this.logger.log(`Soft deleting restaurant with ID: ${id}`);

      // Step 1: Find the restaurant to delete
      const restaurantResponse = await this.findOneRestaurantAsync(id);
      const restaurant = restaurantResponse.data;

      // Step 2: Perform soft delete by marking as inactive
      restaurant.isActive = false;
      await this.restaurantRepository.save(restaurant);

      this.logger.log(`Restaurant with ID ${id} soft deleted successfully`);

      // Step 3: Return success response
      return {
        statusCode: 200,
        message: 'Restaurant deleted successfully',
        data: null,
      };
    } catch (error) {
      this.logger.error(
        `Error deleting restaurant with ID ${id}: ${error.message}`,
        error.stack
      );
      throw new NotFoundException(
        `Error deleting restaurant with ID ${id}: ${error.message}`
      );
    }
  }
}
