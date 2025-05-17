import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserManagementController } from './user-management.controller';
import { UserManagementService } from './user-management.service';
import { User } from './entities/user.entity';
import { UserAddress } from './entities/address.entity';
import { RmqCommunicateModule } from '../rmq-communication/rmq-communicate.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserAddress]),
    RmqCommunicateModule,
  ],
  controllers: [UserManagementController],
  providers: [UserManagementService],
  exports: [UserManagementService],
})
export class UserManagementModule {}
