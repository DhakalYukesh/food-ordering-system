import { Module } from '@nestjs/common';
import { RmqModule, RMQServiceNames } from '@food-ordering-system/common';
import { UserCommunicate } from './user.communication';
import { WalletCommunicate } from './wallet.communication';
import { RestaurantCommunicate } from './restaurant.communication';

@Module({
  imports: [
    RmqModule.registerRpc({ name: RMQServiceNames.RESTAURANT_SERVICE }),
    RmqModule.registerRpc({ name: RMQServiceNames.USER_SERVICE }),
    RmqModule.registerRpc({ name: RMQServiceNames.WALLET_SERVICE }),
  ],
  providers: [RestaurantCommunicate, UserCommunicate, WalletCommunicate],
  exports: [RestaurantCommunicate, UserCommunicate, WalletCommunicate],
})
export class RmqCommunicateModule {}
