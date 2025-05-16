import { Module } from '@nestjs/common';
import { ConfigsModule } from '@food-ordering-system/configs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@food-ordering-system/configs';
import { LoggerModule, RmqModule } from '@food-ordering-system/common';
import { WalletManagementModule } from './wallet-management/wallet-management.module';

@Module({
  imports: [
    ConfigsModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigsModule],
      useFactory: (configService: ConfigService) => configService.getDatabaseConfig(),
      inject: [ConfigService],
    }),
    LoggerModule,
    RmqModule,
    WalletManagementModule,
  ],
})
export class AppModule {}
