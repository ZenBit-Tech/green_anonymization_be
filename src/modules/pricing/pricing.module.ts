import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import SubscriptionPlan from '@common/db/entities/subscription-plan.entity';
import UserSubscription from '@common/db/entities/user-subscription.entity';
import Documents from '@common/db/entities/documents.entity';
import UserModule from '@modules/user/user.module';
import PricingService from './pricing.service';
import PricingController from './pricing.controller';
import SubscriptionLimitGuard from './guards/subscription-limit.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubscriptionPlan, UserSubscription, Documents]),
    UserModule,
  ],
  providers: [PricingService, SubscriptionLimitGuard],
  controllers: [PricingController],
  exports: [PricingService, SubscriptionLimitGuard],
})
export default class PricingModule {}
