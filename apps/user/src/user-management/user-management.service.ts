import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { WalletRmqCommunication } from '../rmq-communication/wallet.communicate';
import { LoggerService } from '@food-ordering-system/common';

@Injectable()
export class UserManagementService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly walletRmqCommunication: WalletRmqCommunication,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UserManagementService.name);
  }

  async getUserWithWallet(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    try {
      // Get the wallet information
      const wallet = await this.walletRmqCommunication.getWalletByUserId(userId);
      return {
        ...user,
        wallet
      };
    } catch (error) {
      this.logger.warn(`Wallet for user ${userId} not found. ${error.message}`);
      return {
        ...user,
        wallet: null
      };
    }
  }

  async createUserWallet(userId: string, initialBalance = 0) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const wallet = await this.walletRmqCommunication.createWallet(userId, initialBalance);
    
    // Update user with wallet ID
    user.walletId = wallet.id;
    await this.userRepository.save(user);
    
    return {
      ...user,
      wallet
    };
  }
}
