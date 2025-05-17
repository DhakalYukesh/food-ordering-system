import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { WalletManagementController } from './wallet-management.controller';
import { WalletManagementService } from './wallet-management.service';
import { LoggerModule } from '@food-ordering-system/common';
import { RmqCommunicateModule } from '../rmq-communication/rmq-communicate.module';
import { TransactionManagementModule } from '../transaction-management/transaction-management.module';
import { Transaction } from '../transaction-management/entities/transaction.entity';

@Module({  
  imports: [
    TypeOrmModule.forFeature([Wallet, Transaction]),
    LoggerModule,
    forwardRef(() => RmqCommunicateModule),
    forwardRef(() => TransactionManagementModule),
  ],
  controllers: [
    WalletManagementController
  ],
  providers: [WalletManagementService],
  exports: [WalletManagementService],
})
export class WalletManagementModule {}
