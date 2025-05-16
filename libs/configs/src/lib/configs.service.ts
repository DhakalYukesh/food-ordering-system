import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { AppConfigSub, JWTConfig } from './interfaces/config.interface';
import { RabbitMQConfig } from './configurations/rabbitmq-config';

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
    const jwtConfig = this.configService.get<JWTConfig>('jwtConfig');

    if (!jwtConfig) {
      throw new Error('JWT config not found');
    }

    return jwtConfig;
  }

  getRabbitmqConfig(): RabbitMQConfig {
    const rmqConfig = this.configService.get<RabbitMQConfig>('rabbitmqConfig');

    if (!rmqConfig) {
      throw new Error('RabbitMQ config not found');
    }

    return rmqConfig;
  }

  getRabbitmqUri(): string {
    return this.getRabbitmqConfig().uri;
  }

  getRabbitmqQueue(name: string): string {
    const queueFromConfig = this.getRabbitmqConfig().queues[name];
    if (queueFromConfig) {
      return queueFromConfig;
    }

    // Fallback to environment variable
    const queueFromEnv = this.configService.get<string>(`RABBITMQ_${name}_QUEUE`);
    if (!queueFromEnv) {
      throw new Error(`RabbitMQ queue ${name} not found in config or environment`);
    }
    
    return queueFromEnv;
  }
}
