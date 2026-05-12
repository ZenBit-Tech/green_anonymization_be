import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import SubscriptionPlan from '@common/db/entities/subscription-plan.entity';
import UserSubscription from '@common/db/entities/user-subscription.entity';
import Documents from '@common/db/entities/documents.entity';
import UserService from '@modules/user/user.service';
import {
  PlanName,
  PRO_PLAN_SUBSCRIPTION_DAYS,
  SubscriptionStatus,
} from './constants/pricing.constants';
import SubscriptionPlanResponseDto from './dto/subscription-plan-response.dto';
import CurrentSubscriptionResponseDto from './dto/current-subscription-response.dto';

const PLAN_NOT_FOUND = 'Subscription plan not found';
const SUBSCRIPTION_NOT_FOUND = 'Active subscription not found';
const USER_NOT_FOUND = 'User not found';

@Injectable()
export default class PricingService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private readonly planRepo: Repository<SubscriptionPlan>,
    @InjectRepository(UserSubscription)
    private readonly subscriptionRepo: Repository<UserSubscription>,
    @InjectRepository(Documents)
    private readonly documentsRepo: Repository<Documents>,
    private readonly userService: UserService,
  ) {}

  async getPlans(): Promise<SubscriptionPlanResponseDto[]> {
    try {
      const plans = await this.planRepo.find({
        where: { isActive: true },
        order: { priceCents: 'ASC' },
      });
      return plans.map((p) => PricingService.mapPlanToDto(p));
    } catch {
      throw new InternalServerErrorException('Failed to load plans');
    }
  }

  async getCurrentSubscription(
    email: string,
  ): Promise<CurrentSubscriptionResponseDto> {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new NotFoundException(USER_NOT_FOUND);

    const subscription = await this.findActiveSubscription(user.uuid);
    if (!subscription) throw new NotFoundException(SUBSCRIPTION_NOT_FOUND);

    const usedToday = await this.countDocumentsToday(user.uuid);

    return {
      status: subscription.status,
      expiresAt: subscription.expiresAt,
      plan: PricingService.mapPlanToDto(subscription.plan),
      usedToday,
      dailyLimit: subscription.plan.documentsPerDay,
    };
  }

  async selectPlan(
    email: string,
    planId: string,
  ): Promise<CurrentSubscriptionResponseDto> {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new NotFoundException(USER_NOT_FOUND);

    const plan = await this.planRepo.findOne({
      where: { uuid: planId, isActive: true },
    });
    if (!plan) throw new NotFoundException(PLAN_NOT_FOUND);

    try {
      await this.subscriptionRepo.manager.transaction(async (manager) => {
        await manager.update(
          UserSubscription,
          { userId: user.uuid, status: SubscriptionStatus.ACTIVE },
          { status: SubscriptionStatus.CANCELLED, cancelledAt: new Date() },
        );

        const expiresAt =
          plan.name === PlanName.FREE
            ? null
            : PricingService.addDays(new Date(), PRO_PLAN_SUBSCRIPTION_DAYS);

        await manager.save(
          manager.create(UserSubscription, {
            userId: user.uuid,
            planId: plan.uuid,
            status: SubscriptionStatus.ACTIVE,
            startedAt: new Date(),
            expiresAt,
          }),
        );
      });
    } catch {
      throw new InternalServerErrorException('Failed to update subscription');
    }

    return this.getCurrentSubscription(email);
  }

  async assignFreePlan(userId: string): Promise<void> {
    const freePlan = await this.planRepo.findOne({
      where: { name: PlanName.FREE, isActive: true },
    });

    if (!freePlan) {
      throw new InternalServerErrorException(
        'Free plan not found. Run seed migration.',
      );
    }

    const existing = await this.subscriptionRepo.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
    });
    if (existing) return;

    await this.subscriptionRepo.save(
      this.subscriptionRepo.create({
        userId,
        planId: freePlan.uuid,
        status: SubscriptionStatus.ACTIVE,
        startedAt: new Date(),
        expiresAt: null,
      }),
    );
  }

  async checkDailyLimitByEmail(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);
    if (!user) return;

    const subscription = await this.findActiveSubscription(user.uuid);
    if (!subscription) return;

    const { documentsPerDay } = subscription.plan;
    if (documentsPerDay === null) return;

    const usedToday = await this.countDocumentsToday(user.uuid);

    if (usedToday >= documentsPerDay) {
      throw new ForbiddenException({
        code: 'DAILY_LIMIT_REACHED',
        message: `Daily limit of ${documentsPerDay} documents reached`,
        limit: documentsPerDay,
        used: usedToday,
      });
    }
  }

  private async findActiveSubscription(
    userId: string,
  ): Promise<UserSubscription | null> {
    return this.subscriptionRepo.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
      relations: { plan: true },
    });
  }

  private async countDocumentsToday(userId: string): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    return this.documentsRepo.count({
      where: { userId, createdAt: MoreThanOrEqual(startOfDay) },
    });
  }

  private static mapPlanToDto(
    plan: SubscriptionPlan,
  ): SubscriptionPlanResponseDto {
    return {
      uuid: plan.uuid,
      name: plan.name,
      priceCents: plan.priceCents,
      documentsPerDay: plan.documentsPerDay,
      features: plan.features,
    };
  }

  private static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}
