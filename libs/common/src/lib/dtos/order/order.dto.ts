import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../../enums';

export class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  foodItemId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  restaurantId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}

export class OrderStatusDto {
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @IsEnum(OrderStatus)
  status: OrderStatus;
}

export class PaymentDto {
  @IsString()
  @IsNotEmpty()
  senderWalletId: string;

  @IsString()
  @IsNotEmpty()
  receiverWalletId: string;

  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  amount: number;
}
