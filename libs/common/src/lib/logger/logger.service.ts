import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { ConfigService as FoodOrderConfigService } from '@food-ordering-system/configs';
import { format } from 'winston';
import * as winston from 'winston';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;
  private context: string | undefined;

  constructor(private configService: FoodOrderConfigService) {
    const appConfig = this.configService.getAppConfig();

    if (!appConfig) {
      throw new Error(
        'App config is not defined! Please check your configuration.'
      );
    }

    this.logger = winston.createLogger({
      level: appConfig.node_env === 'dev' ? 'debug' : 'info',
      format: format.combine(
        format.timestamp(),
        format.json(),
        format.metadata()
      ),
      defaultMeta: {
        service: appConfig.app_name,
        version: appConfig.version,
      },
      transports: [
        new winston.transports.Console({
          format: format.combine(
            format.colorize(),
            format.timestamp(),
            format.printf(({ timestamp, level, message }) => {
              return `${timestamp} [${appConfig.app_name}:${
                this.context && this.context
              }] ${level} : ${message}`;
            })
          ),
        }),
        // Add file transport for production
        ...(appConfig.node_env !== 'dev'
          ? [
              new winston.transports.File({
                filename: `logs/${appConfig.app_name}.error.log`,
                level: 'error',
              }),
              new winston.transports.File({
                filename: `logs/${appConfig.app_name}.combined.log`,
              }),
            ]
          : []),
      ],
    });
  }

  setContext(context: string): void {
    this.context = context;
  }

  log(message: string, context?: string): void {
    this.logger.info(message, context);
  }

  error(message: string, trace?: string, context?: string): void {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string): void {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string): void {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string): void {
    this.logger.verbose(message, { context });
  }
}
