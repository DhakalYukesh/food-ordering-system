import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ConfigsModule as FoodOrderConfigModule,
  ConfigService as FoodOrderConfigService,
} from '@food-ordering-system/configs';
import { LoggerModule } from '@food-ordering-system/common';
import { AuthModule } from '../auth/auth.module';
import { UserManagementModule } from '../user-management/user-management.module';

@Module({
  imports: [
    // Variables
    FoodOrderConfigModule,
    LoggerModule,

    // Config
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [FoodOrderConfigModule],
      inject: [FoodOrderConfigService],
      useFactory: async (configService: FoodOrderConfigService) => {
        return configService.getDatabaseConfig();
      },
    }),
    // TODO: Add Rmq registration 
    // Modules
    AuthModule,
    UserManagementModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
