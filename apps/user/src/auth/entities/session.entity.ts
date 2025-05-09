import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '@food-ordering-system/common';

@Entity('UserSession')
export class UserSession extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ length: 255, unique: true })
  refreshToken: string;

  @Column()
  expiresAt: Date;
}
