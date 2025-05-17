import {
  IsEnum,
  IsUUID,
  IsString,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';
import { TransactionStatus } from '../../enums';

export class UpdateTransactionStatusDto {
  @IsUUID()
  @IsNotEmpty()
  transactionId: string;

  @IsEnum(TransactionStatus)
  @IsNotEmpty()
  status: TransactionStatus;
}

export class ProcessOrderPaymentDto {
  @IsUUID()
  @IsNotEmpty()
  senderWalletId: string;

  @IsUUID()
  @IsNotEmpty()
  receiverWalletId: string;

  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
