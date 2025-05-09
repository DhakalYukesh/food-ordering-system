import { Column, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserAddress } from './address.entity';
import { BaseEntity, UserRole } from '@food-ordering-system/common';

export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'firstName', length: 50 })
  firstName: string;

  @Column({ name: 'lastName', length: 50 })
  lastName: string;

  @Column({ name: 'email', length: 100, unique: true })
  email: string;

  @Column({ name: 'password', length: 100 })
  password: string;

  @Column({ name: 'phone', length: 10 })
  phone: string;

  @Column({ name: 'userName', length: 50, unique: true })
  userName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @OneToOne(() => UserAddress, (userAddress) => userAddress.user, { cascade: true })
  address: UserAddress;

//   @OneToOne(() => UserWallet, (wallet) => wallet.user, { cascade: true })
//   walletId: string;
}
