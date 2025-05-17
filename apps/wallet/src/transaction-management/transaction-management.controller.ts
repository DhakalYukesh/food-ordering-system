import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TransactionManagementService } from './transaction-management.service';
import {
  LoggerService,
  TransactionDto,
  UpdateTransactionStatusDto,
} from '@food-ordering-system/common';

@Controller('transactions')
export class TransactionManagementController {
  constructor(
    private readonly logger: LoggerService,
    private readonly transactionService: TransactionManagementService
  ) {
    this.logger.setContext(TransactionManagementController.name);
  }

  @Get('wallet/:walletId')
  async getTransactionHistory(@Param('walletId') walletId: string) {
    this.logger.log(`Getting transaction history for wallet: ${walletId}`);
    return this.transactionService.getTransactionHistoryAsync(walletId);
  }

  @Post()
  async createTransaction(@Body() createTransactionDto: TransactionDto) {
    this.logger.log(
      `Creating transaction for wallet: ${createTransactionDto.walletId}`
    );
    return this.transactionService.createTransactionAsync(createTransactionDto);
  }
  
  @Post('status')
  async updateTransactionStatus(
    @Body() updateStatusDto: UpdateTransactionStatusDto
  ) {
    this.logger.log(
      `Updating transaction status: ${updateStatusDto.transactionId} to ${updateStatusDto.status}`
    );
    return this.transactionService.finalizeTransactionAsync(
      updateStatusDto.transactionId,
      updateStatusDto.status
    );
  }
}
