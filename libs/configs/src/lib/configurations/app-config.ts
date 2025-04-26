import { registerAs } from '@nestjs/config';
import { AppConfigSub } from '../interfaces/config.interface';

export const appConfig = registerAs<AppConfigSub>('appConfig', () => ({
  app_name: process.env['APP_NAME'] || 'default',
  port: parseInt(process.env['PORT'] || '8090', 10),
  version: process.env['VERSION'] || '1.0.0',
  node_env: (process.env['NODE_ENV'] as 'dev' | 'prod' | 'test') || 'dev',
  app_string: process.env['APP_STRING'] || 'http://localhost:8090',
  app_prefix: process.env['APP_PREFIX'] || 'api',
}));
