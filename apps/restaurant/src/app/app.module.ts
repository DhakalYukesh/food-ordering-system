import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigsModule, ConfigService } from '@food-ordering-system/configs';

@Module({
  imports: [
    ConfigsModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigsModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        ...configService.getDatabaseConfig(),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
