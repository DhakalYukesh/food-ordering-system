import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderManagementController } from './order-management.controller';
import { OrderManagementService } from './order-management.service';
import { RmqCommunicateModule } from '../rmq-communication/rmq-communication.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), RmqCommunicateModule],
  controllers: [OrderManagementController],
  providers: [OrderManagementService],
  exports: [OrderManagementService],
})
export class OrderManagementModule {}
