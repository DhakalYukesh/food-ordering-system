// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Param,
//   Put,
//   Delete,
// } from '@nestjs/common';
// import { CreateFoodItemDto } from '@food-ordering-system/common';
// import { FoodItemService } from './foodItem.service';
// import { FoodItem } from './entities/food-item.entity';

// @Controller('restaurants/:restaurantId/food-items')
// export class FoodItemController {
//   constructor(private readonly foodItemService: FoodItemService) {}

//   @Post()
//   async create(
//     @Param('restaurantId') restaurantId: string,
//     @Body() createFoodItemDto: CreateFoodItemDto
//   ): Promise<FoodItem> {
//     return this.foodItemService.create(restaurantId, createFoodItemDto);
//   }

//   @Get()
//   async findAll(
//     @Param('restaurantId') restaurantId: string
//   ): Promise<FoodItem[]> {
//     return this.foodItemService.findAll(restaurantId);
//   }

//   @Get(':id')
//   async findOne(
//     @Param('restaurantId') restaurantId: string,
//     @Param('id') id: string
//   ): Promise<FoodItem> {
//     return this.foodItemService.findOne(restaurantId, id);
//   }

//   @Put(':id')
//   async update(
//     @Param('restaurantId') restaurantId: string,
//     @Param('id') id: string,
//     @Body() updateFoodItemDto: Partial<CreateFoodItemDto>
//   ): Promise<FoodItem> {
//     return this.foodItemService.update(restaurantId, id, updateFoodItemDto);
//   }

//   @Delete(':id')
//   async remove(
//     @Param('restaurantId') restaurantId: string,
//     @Param('id') id: string
//   ): Promise<void> {
//     return this.foodItemService.remove(restaurantId, id);
//   }
// }
