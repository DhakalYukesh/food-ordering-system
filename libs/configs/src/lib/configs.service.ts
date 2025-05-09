import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { AppConfigSub } from './interfaces/config.interface';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  getAppConfig() {
    return this.configService.get<AppConfigSub>('appConfig');
  }

  getDatabaseConfig() {
    const dbConfig = this.configService.get('databaseConfig');

    return {
      ...dbConfig,
    };
  }

  getJwtConfig() {
    const jwtConfig = this.configService.get('jwtConfig');

    if (!jwtConfig) {
      throw new Error('JWT config not found');
    }

    return jwtConfig;
  }
}
