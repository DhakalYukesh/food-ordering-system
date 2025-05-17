import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { TransactionType } from '../../enums';

export class CreateWalletDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  initialBalance?: number;
}

export class WalletBalanceDto {
  @IsNotEmpty()
  @IsUUID()
  walletId: string;

  @IsNotEmpty()
  @IsNumber()
  balance: number;
}

export class TransactionDto {
  @IsNotEmpty()
  @IsString()
  walletId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsNotEmpty()
  @IsEnum(TransactionType)
  type: TransactionType;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
