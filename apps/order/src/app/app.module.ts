import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ConfigsModule as FoodOrderConfigModule,
  ConfigService as FoodOrderConfigService,
} from '@food-ordering-system/configs';
import { OrderManagementModule } from '../order-management/order-management.module';
import {
  AllExceptionsFilter,
  BaseControlModule,
  LoggerModule,
  RmqModule,
  RMQServiceNames,
} from '@food-ordering-system/common';
import { APP_FILTER } from '@nestjs/core';

@Module({
  imports: [
    // Variables
    FoodOrderConfigModule,
    LoggerModule,

    // Config
    BaseControlModule.register(),
    TypeOrmModule.forRootAsync({
      imports: [FoodOrderConfigModule],
      inject: [FoodOrderConfigService],
      useFactory: async (configService: FoodOrderConfigService) => {
        return configService.getDatabaseConfig();
      },
    }),

    RmqModule.register({ name: RMQServiceNames.ORDER_SERVICE }),
    OrderManagementModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
