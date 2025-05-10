import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Restaurant } from './restaurant.entity';
import { BaseEntity } from '@food-ordering-system/common';

@Entity('RestaurantCategories')
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;
  
  @Column('text', { nullable: true })
  description: string;
  
  @OneToMany(() => Restaurant, restaurant => restaurant.category)
  restaurants: Restaurant[];
}