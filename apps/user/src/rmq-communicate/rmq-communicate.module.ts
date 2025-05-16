import { Module } from '@nestjs/common';
import { RmqModule } from '@food-ordering-system/common';
import { RMQServiceNames } from '@food-ordering-system/common';
import { WalletRmqCommunication } from './wallet.communicate';

@Module({
  imports: [
    RmqModule.registerRpc({ name: RMQServiceNames.WALLET_SERVICE }),
  ],
  providers: [WalletRmqCommunication],
  exports: [WalletRmqCommunication],
})
export class RmqCommunicateModule {}
