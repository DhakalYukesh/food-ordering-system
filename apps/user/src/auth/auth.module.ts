import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user-management/entities/user.entity';
import { UserAddress } from '../user-management/entities/address.entity';
import { LoggerModule } from '@food-ordering-system/common';
import { UserSession } from './entities/session.entity';
import { ConfigsModule as FoodOrderConfigModule } from '@food-ordering-system/configs';
import { RmqCommunicateModule } from '../rmq-communication/rmq-communicate.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserAddress, UserSession]),
    FoodOrderConfigModule,
    LoggerModule,
    RmqCommunicateModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}