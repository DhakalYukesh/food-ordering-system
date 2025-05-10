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

      // Step 3: Save the restaurant
      const restaurant = this.restaurantRepository.create(restaurantData);
      const savedRestaurant = await this.restaurantRepository.save(restaurant);

      if (!savedRestaurant) {
        this.logger.error('Failed to create restaurant');
        throw new NotFoundException('Failed to create restaurant');
      }
      
      this.logger.log(
        `Restaurant created successfully with ID: ${savedRestaurant.id}`
      );

      // Step 4: Return the created restaurant
      return {
        statusCode: 201,
        message: 'Restaurant created successfully',
        data: savedRestaurant,
      }
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

  async findAllRestaurantsAsync(): Promise<Restaurant[]> {
    try {
      return await this.restaurantRepository.find({
        where: { isActive: true },
      });
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

  async findOneRestaurantAsync(id: string): Promise<Restaurant> {
    try {
      const restaurant = await this.restaurantRepository.findOne({
        where: { id, isActive: true },
      });
      if (!restaurant) {
        throw new NotFoundException(`Restaurant with ID ${id} not found`);
      }
      return restaurant;
    } catch (error) {
      this.logger.error(
        `Error fetching restaurant with ID ${id}: ${error.message}`,
        error.stack
      );
      throw new NotFoundException(
        `Error fetching restaurant with ID ${id}: ${error.message}`
      );
    }
  }

  async updateRestaurantAsync(
    id: string,
    updateRestaurantDto: Partial<CreateRestaurantDto>
  ): Promise<Restaurant> {
    try {
      const restaurant = await this.findOneRestaurantAsync(id);
      Object.assign(restaurant, updateRestaurantDto);
      return this.restaurantRepository.save(restaurant);
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

  async deleteRestaurantAsync(id: string): Promise<void> {
    try {
      const restaurant = await this.findOneRestaurantAsync(id);
      restaurant.isActive = false;
      await this.restaurantRepository.save(restaurant);
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
