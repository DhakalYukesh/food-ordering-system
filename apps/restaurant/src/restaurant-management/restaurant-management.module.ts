import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantManagementController } from './restaurant-management.controller';
import { RestaurantManagementService } from './restaurant-management.service';
import { FoodItem } from '../foodItem/entities/food-item.entity';
import { RmqModule, RMQServiceNames } from '@food-ordering-system/common';
import { FoodItemModule } from '../foodItem/foodItem.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Restaurant, FoodItem]),
    RmqModule.registerRpc({ name: RMQServiceNames.RESTAURANT_SERVICE }),
    forwardRef(() => FoodItemModule),
  ],
  controllers: [RestaurantManagementController],
  providers: [RestaurantManagementService],
  exports: [RestaurantManagementService],
})
export class RestaurantManagementModule {}
