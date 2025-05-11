import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '@food-ordering-system/common';
import { FoodItem } from '../../foodItem/entities/food-item.entity';

@Entity('Restaurants')
export class Restaurant extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column()
  googleMapUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  ownerId: string;

  @OneToMany(() => FoodItem, (foodItem) => foodItem.restaurant)
  foodItems: FoodItem[];
}
