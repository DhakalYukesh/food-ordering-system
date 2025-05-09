import { DynamicModule, Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import {
  ConfigsModule as FoodOrderConfigModule,
  ConfigService as FoodOrderConfigService,
} from '@food-ordering-system/configs';
import { JwtServiceName } from '../constants';

@Module({})
export class BaseControlModule {
  static register(): DynamicModule {
    return {
      module: BaseControlModule,
      imports: [
        FoodOrderConfigModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
          imports: [FoodOrderConfigModule],
          inject: [FoodOrderConfigService],
          useFactory: (configService: FoodOrderConfigService) => {
            const { jwtAccessSecret, jwtAccessExpiration } =
              configService.getJwtConfig();
            return {
              secret: jwtAccessSecret,
              signOptions: { expiresIn: jwtAccessExpiration },
            };
          },
        }),
        JwtModule.registerAsync({
          imports: [FoodOrderConfigModule],
          inject: [FoodOrderConfigService],
          useFactory: (configService: FoodOrderConfigService) => {
            const { jwtRefreshSecret, jwtRefreshExpiration } =
              configService.getJwtConfig();
            return {
              secret: jwtRefreshSecret,
              signOptions: { expiresIn: jwtRefreshExpiration },
            };
          },
        }),
      ],
      providers: [
        // TODO: Add custom JWT strategy
        {
          provide: JwtServiceName.JWT_ACCESS_SERVICE,
          useFactory: (jwtService: JwtService) => jwtService,
          inject: [JwtService],
        },
        {
          provide: JwtServiceName.JWT_REFRESH_SERVICE,
          useFactory: (configService: FoodOrderConfigService) => {
            const { jwtRefreshSecret, jwtRefreshExpiration } =
              configService.getJwtConfig();
            return new JwtService({
              secret: jwtRefreshSecret,
              signOptions: { expiresIn: jwtRefreshExpiration },
            });
          },
          inject: [FoodOrderConfigService],
        },
      ],
      exports: [
        PassportModule,
        JwtServiceName.JWT_ACCESS_SERVICE,
        JwtServiceName.JWT_REFRESH_SERVICE,
      ],
      global: true,
    };
  }
}
