import { ConfigService } from '@food-ordering-system/configs';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWTPayload } from '../types/jwt.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(readonly configService: ConfigService) {
    const { jwtAccessSecret } = configService.getJwtConfig();
    if (!jwtAccessSecret) {
      throw new Error('JWT_ACCESS_SECRET is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtAccessSecret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: JWTPayload) {
    return payload;
  }
}