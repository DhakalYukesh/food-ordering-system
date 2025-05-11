import { registerAs } from "@nestjs/config";

export const databaseConfig = registerAs('databaseConfig', () => ({
  type: 'postgres',
  ssl: process.env['NODE_ENV'] === 'prod',
  username: process.env['DB_USER'],
  password: process.env['DB_PASSWORD'],
  host: process.env['DB_HOST'],
  port: parseInt(
    process.env['DB_PORT'] || process.env['DB_PORT'] || '5432',
    10
  ),
  database: process.env['DB_NAME'],
  logging: process.env['NODE_ENV'] === 'dev' ? ['error', 'warn'] : false,
  synchronize: true,
  autoLoadEntities: true,
  // Add retry connection logic
  retryAttempts: 10,
  retryDelay: 5000, // 5 seconds
  keepConnectionAlive: true,
}));
