import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '@food-ordering-system/common';
import { Transaction } from '../../transaction-management/entities/transaction.entity';

@Entity("Wallet")
export class Wallet extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Transaction, transaction => transaction.wallet)
  transactions: Transaction[];
}
