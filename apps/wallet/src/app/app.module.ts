import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ConfigsModule as FoodOrderConfigModule,
  ConfigService as FoodOrderConfigService,
} from '@food-ordering-system/configs';
import { WalletManagementModule } from '../wallet-management/wallet-management.module';
import { BaseControlModule, LoggerModule, RmqModule, RMQServiceNames } from '@food-ordering-system/common';

@Module({
  imports: [
    // Variables
    LoggerModule,
    FoodOrderConfigModule,

    BaseControlModule.register(),
    TypeOrmModule.forRootAsync({
      imports: [FoodOrderConfigModule],
      inject: [FoodOrderConfigService],
      useFactory: async (configService: FoodOrderConfigService) => {
        return configService.getDatabaseConfig();
      },
    }),

    RmqModule.register({ name: RMQServiceNames.WALLET_SERVICE }),
    WalletManagementModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
