import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity, OrderStatus } from '@food-ordering-system/common';

@Entity('Orders')
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  restaurantId: string;

  @Column()
  restaurantOwnerId: string;

  @Column({ type: 'jsonb' })
  items: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.CREATED,
  })
  status: OrderStatus;

  @Column({ nullable: true })
  paymentId: string;
}
