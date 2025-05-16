/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import {
  createWinstonLogger,
  RmqService,
  RMQServiceNames,
  LoggerService,
  AllExceptionsFilter,
  RpcTransformInterceptor,
} from '@food-ordering-system/common';
import { ConfigService } from '@food-ordering-system/configs';
import { MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const nodeEnv = process.env.NODE_ENV || 'dev';
  const appName = process.env.APP_NAME || 'Wallet';

  const app = await NestFactory.create(AppModule, {
    logger: createWinstonLogger(appName, nodeEnv),
  });

  const logger = app.get(LoggerService);
  const configService = app.get(ConfigService);
  const rmqService = app.get(RmqService);
  const { port, app_prefix } = configService.getAppConfig();

  // Set up global interceptors and filters
  app.useGlobalInterceptors(new RpcTransformInterceptor(logger));
  app.useGlobalFilters(new AllExceptionsFilter(logger));
  app.enableCors();
  app.setGlobalPrefix(app_prefix);

  // Apply ValidationPipe globally to enable DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  // Global interceptor for RPC responses
  app.useGlobalInterceptors(new RpcTransformInterceptor(logger));

  // Global filter for RPC exceptions
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  // Setup RabbitMQ listener
  const microserviceOptions: MicroserviceOptions = rmqService.getOptions(
    RMQServiceNames.WALLET_SERVICE
  );
  app.connectMicroservice(microserviceOptions, {
    inheritAppConfig: true,
  });
  await app.startAllMicroservices();
  logger.log('Wallet microservice is listening for RPC calls');

  await app.listen(port);
  logger.log(`Application is running on: ${await app.getUrl()}`);
}

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

bootstrap();
