import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '@food-ordering-system/common';
import { Transaction } from './entities/transaction.entity';
import { RmqCommunicateModule } from '../rmq-communication/rmq-communicate.module';
import { WalletManagementModule } from '../wallet-management/wallet-management.module';
import { TransactionManagementController } from './transaction-management.controller';
import { TransactionManagementService } from './transaction-management.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    LoggerModule,
    forwardRef(() => RmqCommunicateModule),
    forwardRef(() => WalletManagementModule),
  ],
  controllers: [TransactionManagementController],
  providers: [TransactionManagementService],
  exports: [TransactionManagementService],
})
export class TransactionManagementModule {}
