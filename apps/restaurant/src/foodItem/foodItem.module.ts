import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantManagementModule } from '../restaurant-management/restaurant-management.module';
import { FoodItemController } from './foodItem.controller';
import { FoodItemService } from './foodItem.service';
import { FoodItem } from './entities/food-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FoodItem]), RestaurantManagementModule],
  controllers: [FoodItemController],
  providers: [FoodItemService],
})
export class FoodItemModule {}
