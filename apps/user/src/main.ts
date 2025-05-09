/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { createWinstonLogger } from '@food-ordering-system/common';
import { ConfigService } from '@food-ordering-system/configs';

async function bootstrap() {
  const nodeEnv = process.env.NODE_ENV || 'dev';
  const appName = process.env.APP_NAME || 'Auth & User';

  const app = await NestFactory.create(AppModule, {
    logger: createWinstonLogger(appName, nodeEnv),
  });

  const logger = new Logger();
  const configService = app.get(ConfigService);
  const { port, app_prefix } = configService.getAppConfig();

  app.enableCors();
  app.setGlobalPrefix(app_prefix);

  // Apply ValidationPipe globally to enable DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(port);
  logger.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
