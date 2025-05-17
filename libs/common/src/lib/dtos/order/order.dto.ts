import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../../enums';

export class OrderItemDto {
  @IsNotEmpty()
  @IsUUID()
  foodItemId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsUUID()
  restaurantId: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}

export class OrderStatusDto {
  @IsNotEmpty()
  @IsUUID()
  orderId: string;

  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

export class PaymentDto {
  @IsNotEmpty()
  @IsUUID()
  senderWalletId: string;

  @IsNotEmpty()
  @IsUUID()
  receiverWalletId: string;

  @IsNotEmpty()
  @IsUUID()
  orderId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;
}
