import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Observable } from 'rxjs';
import { JWTPayload } from '../types/jwt.type';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  override canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  override handleRequest<TUser = JWTPayload>(
    err: Error | null,
    user: JWTPayload | null,
  ): TUser {
    if (err) {
      this.logger.error(`JWT Auth Error: ${err.message}`);
      throw err;
    }

    console.log('user', user);
    if (!user) {
      this.logger.error('JWT Auth - No user found in request');
      throw new UnauthorizedException('User not authenticated');
    }

    return user as TUser;
  }
}