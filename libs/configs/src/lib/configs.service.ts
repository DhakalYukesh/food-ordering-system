import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { AppConfigSub } from './interfaces/config.interface';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  getAppConfig() {
    return this.configService.get<AppConfigSub>('appConfig');
  }
}
