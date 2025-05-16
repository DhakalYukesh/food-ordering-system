import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';
import { WalletManagementController } from './wallet-management.controller';
import { WalletManagementService } from './wallet-management.service';
import { WalletManagementRpcController } from './rmq-communication/wallet-management-rpc.controller';
import { RmqModule, LoggerModule } from '@food-ordering-system/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, Transaction]),
    RmqModule,
    LoggerModule,
  ],
  controllers: [WalletManagementController, WalletManagementRpcController],
  providers: [WalletManagementService],
  exports: [WalletManagementService],
})
export class WalletManagementModule {}
