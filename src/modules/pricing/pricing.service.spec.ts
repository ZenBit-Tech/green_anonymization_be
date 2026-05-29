import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import SubscriptionPlan from '@common/db/entities/subscription-plan.entity';
import UserSubscription from '@common/db/entities/user-subscription.entity';
import Documents from '@common/db/entities/documents.entity';
import UserService from '@modules/user/user.service';
import User from '@common/db/entities/user.entity';
import {
  DAILY_EDIT_LIMIT_REACHED_CODE,
  DAILY_LIMIT_REACHED_CODE,
  PlanName,
  SubscriptionStatus,
} from './constants/pricing.constants';
import PricingService from './pricing.service';

const mockFreePlan: Partial<SubscriptionPlan> = {
  uuid: 'free-plan-uuid',
  name: PlanName.FREE,
  priceCents: 0,
  documentsPerDay: 5,
  editsPerDay: 3,
  features: ['pii_detection', 'standard_deid'],
  isActive: true,
};

const mockProPlan: Partial<SubscriptionPlan> = {
  uuid: 'pro-plan-uuid',
  name: PlanName.PRO,
  priceCents: 4900,
  documentsPerDay: null,
  editsPerDay: null,
  features: ['pii_detection', 'advanced_deid'],
  isActive: true,
};

const mockUser: Partial<User> = {
  uuid: 'user-uuid',
  email: 'test@test.com',
};

const mockFreeSubscription: Partial<UserSubscription> = {
  uuid: 'sub-uuid',
  userId: 'user-uuid',
  status: SubscriptionStatus.ACTIVE,
  plan: mockFreePlan as SubscriptionPlan,
  expiresAt: null,
};

const mockProSubscription: Partial<UserSubscription> = {
  uuid: 'sub-uuid-pro',
  userId: 'user-uuid',
  status: SubscriptionStatus.ACTIVE,
  plan: mockProPlan as SubscriptionPlan,
  expiresAt: null,
};

describe('PricingService', () => {
  let service: PricingService;

  const planRepoMock = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const subscriptionRepoMock = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    manager: {
      transaction: jest.fn((cb: (manager: unknown) => Promise<void>) =>
        cb({
          update: jest.fn().mockResolvedValue({}),
          save: jest.fn().mockResolvedValue({}),
          create: jest.fn().mockReturnValue({}),
        }),
      ),
    },
  };

  const documentsRepoMock = {
    createQueryBuilder: jest.fn(),
  };

  const userServiceMock = {
    findByEmail: jest.fn(),
  };

  const buildQbMock = (result: unknown) => ({
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getRawOne: jest.fn().mockResolvedValue(result),
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingService,
        {
          provide: getRepositoryToken(SubscriptionPlan),
          useValue: planRepoMock,
        },
        {
          provide: getRepositoryToken(UserSubscription),
          useValue: subscriptionRepoMock,
        },
        { provide: getRepositoryToken(Documents), useValue: documentsRepoMock },
        { provide: UserService, useValue: userServiceMock },
      ],
    }).compile();

    service = module.get(PricingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPlans', () => {
    it('should return mapped active plans', async () => {
      planRepoMock.find.mockResolvedValue([mockFreePlan, mockProPlan]);

      const result = await service.getPlans();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe(PlanName.FREE);
      expect(result[1].name).toBe(PlanName.PRO);
    });

    it('should throw InternalServerErrorException when DB fails', async () => {
      planRepoMock.find.mockRejectedValue(new Error('DB error'));

      await expect(service.getPlans()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getCurrentSubscription', () => {
    beforeEach(() => {
      userServiceMock.findByEmail.mockResolvedValue(mockUser);
      subscriptionRepoMock.findOne.mockResolvedValue(mockFreeSubscription);
      documentsRepoMock.createQueryBuilder.mockReturnValue(
        buildQbMock({
          count: '2',
          firstCreatedAt: new Date('2026-05-13T09:30:00Z'),
        }),
      );
    });

    it('should return subscription with usedToday, editsUsedToday and resetAt', async () => {
      const result = await service.getCurrentSubscription('test@test.com');

      expect(result.usedToday).toBe(2);
      expect(result.dailyLimit).toBe(5);
      expect(result.editsPerDay).toBe(3);
      expect(result.editsUsedToday).toBe(2);
      expect(result.resetAt).not.toBeNull();
      expect(result.plan.name).toBe(PlanName.FREE);
    });

    it('should return null resetAt for unlimited plan', async () => {
      subscriptionRepoMock.findOne.mockResolvedValue(mockProSubscription);

      const result = await service.getCurrentSubscription('test@test.com');

      expect(result.resetAt).toBeNull();
      expect(result.dailyLimit).toBeNull();
    });

    it('should throw NotFoundException if user not found', async () => {
      userServiceMock.findByEmail.mockResolvedValue(null);

      await expect(
        service.getCurrentSubscription('unknown@test.com'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if no active subscription', async () => {
      subscriptionRepoMock.findOne.mockResolvedValue(null);

      await expect(
        service.getCurrentSubscription('test@test.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('checkDailyLimitByEmail', () => {
    it('should not throw when limit not reached', async () => {
      userServiceMock.findByEmail.mockResolvedValue(mockUser);
      subscriptionRepoMock.findOne.mockResolvedValue(mockFreeSubscription);
      documentsRepoMock.createQueryBuilder.mockReturnValue(
        buildQbMock({ count: '3', firstCreatedAt: null }),
      );

      await expect(
        service.checkDailyLimitByEmail('test@test.com'),
      ).resolves.not.toThrow();
    });

    it('should throw ForbiddenException with DAILY_LIMIT_REACHED_CODE when limit reached', async () => {
      userServiceMock.findByEmail.mockResolvedValue(mockUser);
      subscriptionRepoMock.findOne.mockResolvedValue(mockFreeSubscription);
      documentsRepoMock.createQueryBuilder.mockReturnValue(
        buildQbMock({ count: '5', firstCreatedAt: null }),
      );

      const error = await service
        .checkDailyLimitByEmail('test@test.com')
        .catch((e: unknown) => e);

      expect(error).toBeInstanceOf(ForbiddenException);
      expect((error as ForbiddenException).getResponse()).toMatchObject({
        code: DAILY_LIMIT_REACHED_CODE,
        limit: 5,
        used: 5,
      });
    });

    it('should not throw for Pro plan regardless of count', async () => {
      userServiceMock.findByEmail.mockResolvedValue(mockUser);
      subscriptionRepoMock.findOne.mockResolvedValue(mockProSubscription);

      await expect(
        service.checkDailyLimitByEmail('test@test.com'),
      ).resolves.not.toThrow();
    });

    it('should not throw if user not found', async () => {
      userServiceMock.findByEmail.mockResolvedValue(null);

      await expect(
        service.checkDailyLimitByEmail('unknown@test.com'),
      ).resolves.not.toThrow();
    });
  });

  describe('checkDailyReanalysisLimit', () => {
    it('should not throw when edit limit not reached', async () => {
      userServiceMock.findByEmail.mockResolvedValue(mockUser);
      subscriptionRepoMock.findOne.mockResolvedValue(mockFreeSubscription);
      documentsRepoMock.createQueryBuilder.mockReturnValue(
        buildQbMock({ count: '1', firstCreatedAt: null }),
      );

      await expect(
        service.checkDailyReanalysisLimit('test@test.com'),
      ).resolves.not.toThrow();
    });

    it('should throw ForbiddenException with DAILY_EDIT_LIMIT_REACHED_CODE when edit limit reached', async () => {
      userServiceMock.findByEmail.mockResolvedValue(mockUser);
      subscriptionRepoMock.findOne.mockResolvedValue(mockFreeSubscription);
      documentsRepoMock.createQueryBuilder.mockReturnValue(
        buildQbMock({ count: '3', firstCreatedAt: null }),
      );

      const error = await service
        .checkDailyReanalysisLimit('test@test.com')
        .catch((e: unknown) => e);

      expect(error).toBeInstanceOf(ForbiddenException);
      expect((error as ForbiddenException).getResponse()).toMatchObject({
        code: DAILY_EDIT_LIMIT_REACHED_CODE,
        limit: 3,
        used: 3,
      });
    });

    it('should not throw for Pro plan (unlimited edits)', async () => {
      userServiceMock.findByEmail.mockResolvedValue(mockUser);
      subscriptionRepoMock.findOne.mockResolvedValue(mockProSubscription);

      await expect(
        service.checkDailyReanalysisLimit('test@test.com'),
      ).resolves.not.toThrow();
    });

    it('should not throw if user not found', async () => {
      userServiceMock.findByEmail.mockResolvedValue(null);

      await expect(
        service.checkDailyReanalysisLimit('unknown@test.com'),
      ).resolves.not.toThrow();
    });
  });

  describe('assignFreePlan', () => {
    it('should create free subscription if none exists', async () => {
      planRepoMock.findOne.mockResolvedValue(mockFreePlan);
      subscriptionRepoMock.findOne.mockResolvedValue(null);
      subscriptionRepoMock.create.mockReturnValue({});
      subscriptionRepoMock.save.mockResolvedValue({});

      await expect(service.assignFreePlan('user-uuid')).resolves.not.toThrow();
      expect(subscriptionRepoMock.save).toHaveBeenCalledTimes(1);
    });

    it('should skip if active subscription already exists', async () => {
      planRepoMock.findOne.mockResolvedValue(mockFreePlan);
      subscriptionRepoMock.findOne.mockResolvedValue(mockFreeSubscription);

      await service.assignFreePlan('user-uuid');

      expect(subscriptionRepoMock.save).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if free plan not found', async () => {
      planRepoMock.findOne.mockResolvedValue(null);

      await expect(service.assignFreePlan('user-uuid')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
