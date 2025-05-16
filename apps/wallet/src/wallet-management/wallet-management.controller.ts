import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { WalletManagementService } from './wallet-management.service';
import { CreateWalletDto, TransactionDto } from '@food-ordering-system/common';

@Controller('wallet')
export class WalletManagementController {
  constructor(private readonly walletManagementService: WalletManagementService) {}

  @Post()
  async createWallet(@Body() createWalletDto: CreateWalletDto) {
    return this.walletManagementService.createWallet(createWalletDto);
  }

  @Get('user/:userId')
  async getWalletByUserId(@Param('userId') userId: string) {
    return this.walletManagementService.getWalletByUserId(userId);
  }

  @Get(':id')
  async getWalletById(@Param('id') id: string) {
    return this.walletManagementService.getWalletById(id);
  }

  @Get(':id/transactions')
  async getTransactionHistory(@Param('id') walletId: string) {
    return this.walletManagementService.getTransactionHistory(walletId);
  }

  @Post('transaction')
  async processTransaction(@Body() transactionDto: TransactionDto) {
    return this.walletManagementService.processTransaction(transactionDto);
  }
}
