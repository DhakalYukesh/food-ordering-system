import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodItem } from './entities/food-item.entity';
import { FoodItemController } from './foodItem.controller';
import { FoodItemService } from './foodItem.service';
import { RestaurantManagementModule } from '../restaurant-management/restaurant-management.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FoodItem]),
    forwardRef(() => RestaurantManagementModule),
  ],
  controllers: [FoodItemController],
  providers: [FoodItemService],
  exports: [FoodItemService],
})
export class FoodItemModule {}
