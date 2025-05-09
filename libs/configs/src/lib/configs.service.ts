import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { AppConfigSub, JWTConfig } from './interfaces/config.interface';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  getAppConfig() {
    return this.configService.get<AppConfigSub>('appConfig');
  }

   getTypeOrmConfig(): TypeOrmModuleOptions {
    const dbConfig = this.configService.get('database');

    return {
      ...dbConfig,
    };
  }

  getDatabaseConfig() {
    const dbConfig = this.configService.get('databaseConfig');

    return {
      ...dbConfig,
    };
  }

  getJwtConfig() {
    const jwtConfig = this.configService.get<JWTConfig>('jwtConfig');

    if (!jwtConfig) {
      throw new Error('JWT config not found');
    }

    return jwtConfig;
  }
}
