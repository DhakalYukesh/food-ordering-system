import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { appConfig } from './configurations/app-config';
import { ConfigService } from './configs.service';
import { databaseConfig } from './configurations/database-config';
import { jwtConfig } from './configurations/jwt-config';
import { rabbitmqConfig } from './configurations/rabbitmq-config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, rabbitmqConfig],
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigsModule {}
