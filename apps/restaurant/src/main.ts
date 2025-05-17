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
  const appName = process.env.APP_NAME || 'Restaurant';

  const app = await NestFactory.create(AppModule, {
    logger: createWinstonLogger(appName, nodeEnv),
  });

  const logger = app.get(LoggerService);
  const configService = app.get(ConfigService);
  const rmqService = app.get(RmqService);
  const { port, app_prefix } = configService.getAppConfig();

  // HTTP related settings
  app.enableCors();
  app.setGlobalPrefix(app_prefix);

  // Shared settings (for both HTTP and RPC)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  // Handle both HTTP exceptions and RPC exceptions
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  // Transform both HTTP and RPC responses
  app.useGlobalInterceptors(new RpcTransformInterceptor(logger));

  // Setup RabbitMQ listener for RPC
  const microserviceOptions: MicroserviceOptions = rmqService.getOptions(
    RMQServiceNames.RESTAURANT_SERVICE
  );
  app.connectMicroservice(microserviceOptions, {
    inheritAppConfig: true,
  });

  // Start both services
  await app.startAllMicroservices();
  logger.log('Restaurant microservice is listening for RPC calls');

  await app.listen(port);
  logger.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
