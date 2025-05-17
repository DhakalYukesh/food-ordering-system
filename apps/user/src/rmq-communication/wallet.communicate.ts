import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import {
  LoggerService,
  RMQServiceNames,
  WalletMessagePatterns,
} from '@food-ordering-system/common';

@Injectable()
export class WalletRmqCommunication {
  constructor(
    @Inject(RMQServiceNames.WALLET_SERVICE) private walletClient: ClientProxy,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(WalletRmqCommunication.name);
  }

  async getWalletByUserId(userId: string) {
    try {
      this.logger.log(`Fetching wallet for user: ${userId}`);
      return await firstValueFrom(
        this.walletClient.send(
          WalletMessagePatterns.GET_WALLET_BY_USER_ID,
          userId
        ).pipe(
          catchError((error) => {
            // Handle RPC errors more gracefully
            this.logger.error(
              `RPC Error: ${error.message || JSON.stringify(error)}`
            );
            throw new Error(
              `Could not get wallet: ${error.message || 'Unknown error'}`
            );
          })
        )
      );
    } catch (error) {
      this.logger.error(`Error fetching wallet: ${error.message}`);
      throw error;
    }
  }

  async createWallet(userId: string, initialBalance = 0) {
    try {
      const createWalletDto = {
        userId,
        initialBalance,
      };
      this.logger.log(`Creating wallet for user: ${userId}`);
      return await firstValueFrom(
        this.walletClient.send(
          WalletMessagePatterns.CREATE_WALLET,
          createWalletDto
        ).pipe(
          catchError((error) => {
            this.logger.error(
              `RPC Error: ${error.message || JSON.stringify(error)}`
            );
            throw new Error(
              `Could not create wallet: ${error.message || 'Unknown error'}`
            );
          })
        )
      );
    } catch (error) {
      this.logger.error(`Error creating wallet: ${error.message}`);
      throw error;
    }
  }
}
