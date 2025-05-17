import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Wallet } from '../../wallet-management/entities/wallet.entity';
import { TransactionType, TransactionStatus, BaseEntity } from '@food-ordering-system/common';

@Entity("Transactions")
export class Transaction extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  walletId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ nullable: true })
  orderId: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Wallet, wallet => wallet.transactions)
  @JoinColumn({ name: 'walletId' })
  wallet: Wallet;
}
