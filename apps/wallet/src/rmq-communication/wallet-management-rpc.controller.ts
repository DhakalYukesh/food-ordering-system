import { Controller, Inject, forwardRef } from '@nestjs/common';
import {
  MessagePattern,
  Payload,
  Ctx,
  RmqContext,
  RpcException,
} from '@nestjs/microservices';
import { WalletManagementService } from '../wallet-management/wallet-management.service';
import { LoggerService, RmqService, WalletMessagePatterns, CreateWalletDto } from '@food-ordering-system/common';

@Controller()
export class WalletManagementRpcController {
  constructor(
    @Inject(forwardRef(() => WalletManagementService))
    private readonly walletManagementService: WalletManagementService,
    private readonly rmqService: RmqService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(WalletManagementRpcController.name);
  }

  @MessagePattern(WalletMessagePatterns.GET_WALLET_BY_USER_ID)
  async getWalletByUserId(
    @Payload() userId: string,
    @Ctx() context: RmqContext
  ) {
    this.logger.log(`RPC: Getting wallet for user: ${userId}`);
    this.rmqService.acknowledgeMessage(context);

    try {
      const wallet = await this.walletManagementService.getWalletByUserIdAsync(userId);
      return wallet;
    } catch (error) {
      this.logger.error(`Error getting wallet: ${error.message}`);
      // Use a simple string message that can be easily serialized
      throw new RpcException(`Wallet not found for user: ${userId}`);
    }
  }

  @MessagePattern(WalletMessagePatterns.CREATE_WALLET)
  async createWallet(
    @Payload() createWalletDto: CreateWalletDto,
    @Ctx() context: RmqContext
  ) {
    this.logger.log(`RPC: Creating wallet for user: ${createWalletDto.userId}`);
    this.rmqService.acknowledgeMessage(context);

    try {
      const wallet = await this.walletManagementService.createWalletAsync(createWalletDto);
      return wallet;
    } catch (error) {
      this.logger.error(`Error creating wallet: ${error.message}`);
      throw new RpcException(`Failed to create wallet: ${error.message}`);
    }
  }
}
