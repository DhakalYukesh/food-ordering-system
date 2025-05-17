import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { WalletManagementService } from './wallet-management.service';
import {
  LoggerService,
  CreateWalletDto,
  TransactionDto,
} from '@food-ordering-system/common';

@Controller('wallet')
export class WalletManagementController {
  constructor(
    private readonly logger: LoggerService,
    private readonly walletManagementService: WalletManagementService
  ) {
    this.logger.setContext(WalletManagementController.name);
  }

  @Post()
  createWallet(@Body() createWalletDto: CreateWalletDto) {
    this.logger.log(`Creating wallet for user: ${createWalletDto.userId}`);

    return this.walletManagementService.createWalletAsync(createWalletDto);
  }

  @Get('user/:userId')
  getWalletByUserId(@Param('userId') userId: string) {
    this.logger.log(`Getting wallet for user: ${userId}`);

    return this.walletManagementService.getWalletByUserIdAsync(userId);
  }

  @Get(':id')
  getWalletById(@Param('id') id: string) {
    this.logger.log(`Getting wallet by ID: ${id}`);

    return this.walletManagementService.getWalletByIdAsync(id);
  }

  @Get(':id/transactions')
  getTransactionHistory(@Param('id') walletId: string) {
    this.logger.log(`Getting transaction history for wallet: ${walletId}`);

    return this.walletManagementService.getTransactionHistoryAsync(walletId);
  }

  @Post('transaction')
  async processTransaction(@Body() transactionDto: TransactionDto) {
    this.logger.log(
      `Processing transaction for wallet: ${transactionDto.walletId}`
    );

    // Delegate to wallet service which will then use the transaction service
    return this.walletManagementService.processTransactionAsync(transactionDto);
  }
}
