import { Module, forwardRef } from '@nestjs/common';
import { RmqModule, RMQServiceNames } from '@food-ordering-system/common';
import { OrderCommunicate } from './order.communicate';
import { WalletPaymentEventController } from './wallet-payment-event.controller';
import { WalletManagementRpcController } from './wallet-management-rpc.controller';
import { WalletManagementModule } from '../wallet-management/wallet-management.module';
import { TransactionManagementModule } from '../transaction-management/transaction-management.module';

@Module({
  imports: [
    RmqModule.registerRpc({ name: RMQServiceNames.ORDER_SERVICE }),
    forwardRef(() => WalletManagementModule),
    forwardRef(() => TransactionManagementModule),
  ],
  controllers: [WalletPaymentEventController, WalletManagementRpcController],
  providers: [OrderCommunicate],
  exports: [OrderCommunicate],
})
export class RmqCommunicateModule {}
