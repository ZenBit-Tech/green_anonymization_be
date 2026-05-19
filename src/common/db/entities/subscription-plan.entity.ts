import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import {
  FeatureKey,
  PlanName,
} from '@modules/pricing/constants/pricing.constants';

@Entity({ name: 'subscription_plans' })
export default class SubscriptionPlan {
  @PrimaryGeneratedColumn('uuid')
  uuid!: string;

  @Column({ type: 'enum', enum: PlanName })
  name!: PlanName;

  @Column({ type: 'int', name: 'price_cents' })
  priceCents: number = 0;

  @Column({ type: 'int', name: 'documents_per_day', nullable: true })
  documentsPerDay!: number | null;

  @Column({ type: 'json' })
  features: FeatureKey[] = [];

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean = true;

  @CreateDateColumn({ type: 'datetime', precision: 6 })
  createdAt: Date = new Date();
}
