import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '@food-ordering-system/common';
import { Restaurant } from '../../restaurant-management/entities/restaurant.entity';

@Entity('FoodItems')
export class FoodItem extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ default: true })
  isAvailable: boolean;

  @Column()
  restaurantId: string;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.foodItems)
  @JoinColumn({ name: 'restaurantId' })
  restaurant: Restaurant;
}
