import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantManagementController } from './restaurant-management.controller';
import { RestaurantManagementService } from './restaurant-management.service';
import { Category } from './entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, Category])],
  controllers: [RestaurantManagementController],
  providers: [RestaurantManagementService],
  exports: [RestaurantManagementService],
})
export class RestaurantManagementModule {}
