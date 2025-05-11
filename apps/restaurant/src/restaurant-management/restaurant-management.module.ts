import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantManagementController } from './restaurant-management.controller';
import { RestaurantManagementService } from './restaurant-management.service';
import { FoodItem } from '../foodItem/entities/food-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, FoodItem])],
  controllers: [RestaurantManagementController],
  providers: [RestaurantManagementService],
  exports: [RestaurantManagementService],
})
export class RestaurantManagementModule {}
