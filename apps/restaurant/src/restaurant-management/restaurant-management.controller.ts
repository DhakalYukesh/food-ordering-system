import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import {
  CheckAccess,
  CreateRestaurantDto,
  CurrentUser,
  HasRole,
  LoggerService,
} from '@food-ordering-system/common';
import { RestaurantManagementService } from './restaurant-management.service';

@Controller('restaurants')
export class RestaurantManagementController {
  constructor(
    private readonly logger: LoggerService,
    private readonly restaurantManagementService: RestaurantManagementService
  ) {
    this.logger.setContext(RestaurantManagementController.name);
  }

  @Post()
  @CheckAccess([HasRole.CUSTOMER, HasRole.RESTAURANT_OWNER])
  createRestaurant(
    @CurrentUser('sub') ownerId: string,
    @Body() createRestaurantDto: CreateRestaurantDto
  ) {
    this.logger.log(
      `Creating restaurant with name: ${createRestaurantDto.name}`
    );

    return this.restaurantManagementService.createRestaurantAsync(
      ownerId,
      createRestaurantDto
    );
  }

  @Get()
  findAllRestaurants() {
    this.logger.log('Fetching all restaurants');

    return this.restaurantManagementService.findAllRestaurantsAsync();
  }

  @Get(':id')
  findOneRestaurant(@Param('id') id: string) {
    this.logger.log(`Fetching restaurant with id: ${id}`);

    return this.restaurantManagementService.findOneRestaurantAsync(id);
  }

  @Put(':id')
  updateRestaurant(
    @Param('id') id: string,
    @Body() updateRestaurantDto: Partial<CreateRestaurantDto>
  ) {
    this.logger.log(
      `Updating restaurant with id: ${id} and name: ${updateRestaurantDto.name}`
    );

    return this.restaurantManagementService.updateRestaurantAsync(
      id,
      updateRestaurantDto
    );
  }

  @Delete(':id')
  deleteRestaurant(@Param('id') id: string) {
    this.logger.log(`Deleting restaurant with id: ${id}`);

    return this.restaurantManagementService.deleteRestaurantAsync(id);
  }
}
