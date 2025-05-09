import { registerAs } from '@nestjs/config';
import { JWTConfig } from '../interfaces/config.interface';

export const jwtConfig = registerAs<JWTConfig>('jwtConfig', () => ({
  jwtAccessSecret: process.env['JWT_ACCESS_SECRET'] || 'FZmMLrD81Gg6MUB',
  jwtAccessExpiration: process.env['JWT_ACCESS_EXPIRATION'] || '2h',
  jwtRefreshSecret: process.env['JWT_REFRESH_SECRET'] || 'PXUQc3aC5zh5H85',
  jwtRefreshExpiration: process.env['JWT_REFRESH_EXPIRATION'] || '30d',
}));
