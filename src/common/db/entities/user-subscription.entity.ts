import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { SubscriptionStatus } from '@modules/pricing/constants/pricing.constants';
import User from './user.entity';
import SubscriptionPlan from './subscription-plan.entity';

@Entity({ name: 'user_subscriptions' })
@Index('IDX_USER_SUBSCRIPTIONS_USER_STATUS', ['userId', 'status'])
export default class UserSubscription {
  @PrimaryGeneratedColumn('uuid')
  uuid!: string;

  @Index('IDX_USER_SUBSCRIPTIONS_USER_ID')
  @Column({ type: 'uuid', name: 'user_id' })
  userId: string = '';

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'uuid', name: 'plan_id' })
  planId: string = '';

  @ManyToOne(() => SubscriptionPlan)
  @JoinColumn({ name: 'plan_id' })
  plan!: SubscriptionPlan;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus = SubscriptionStatus.ACTIVE;

  @Column({ type: 'datetime', name: 'started_at' })
  startedAt: Date = new Date();

  @Column({ type: 'datetime', name: 'expires_at', nullable: true })
  expiresAt!: Date | null;

  @Column({ type: 'datetime', name: 'cancelled_at', nullable: true })
  cancelledAt!: Date | null;

  @CreateDateColumn({ type: 'datetime', precision: 6 })
  createdAt: Date = new Date();
}
