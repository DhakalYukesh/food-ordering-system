export interface AppConfig {
  app_name: string;
  port: number;
  version: string;
  node_env: 'dev' | 'prod' | 'test';
  app_string: string;
  app_prefix: string;
}

export type AppConfigSub = Pick<AppConfig, 'app_name' | 'port' | 'version'>;