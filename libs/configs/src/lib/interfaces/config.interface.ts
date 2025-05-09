export interface AppConfig {
  app_name: string;
  port: number;
  version: string;
  node_env: 'dev' | 'prod' | 'test';
  app_string: string;
  app_prefix: string;
}

export type AppConfigSub = Pick<AppConfig, 'app_name' | 'port' | 'version' | 'node_env' | 'app_string' | 'app_prefix'>;

export interface DatabaseConfig {
  type: 'postgres' | 'mysql' | 'mongodb';
  ssl: boolean;
  username: string;
  password: string;
  host: string;
  port: number;
  database: string;
  synchronize: boolean;
  logging: string[];
}

export interface JwtConfig {
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  jwtAccessExpiresIn: string;
  jwtRefreshExpiresIn: string;
}