import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user-management/entities/user.entity';
import { UserAddress } from '../user-management/entities/address.entity';
import { LoggerModule } from '@food-ordering-system/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserAddress]),
    LoggerModule
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
