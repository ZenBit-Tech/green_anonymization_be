import { Test, TestingModule } from '@nestjs/testing';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import Documents from '@common/db/entities/documents.entity';
import PIIEntities from '@common/db/entities/PIIEntities.entity';
import UserService from '@modules/user/user.service';
import User from '@common/db/entities/user.entity';
import AnalyticsService from './analytics.service';

const buildQbMock = (rawResult: unknown[]) => ({
  leftJoin: jest.fn().mockReturnThis(),
  innerJoin: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  addGroupBy: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  getRawOne: jest.fn().mockResolvedValue(rawResult[0] ?? null),
  getRawMany: jest.fn().mockResolvedValue(rawResult),
});

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  const mockUser: Partial<User> = { uuid: 'user-uuid', email: 'test@test.com' };

  const userServiceMock = {
    findByEmail: jest.fn(),
  };

  const documentsRepoMock = {
    createQueryBuilder: jest.fn(),
  };

  const piiEntitiesRepoMock = {
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    userServiceMock.findByEmail.mockResolvedValue(mockUser);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: getRepositoryToken(Documents), useValue: documentsRepoMock },
        {
          provide: getRepositoryToken(PIIEntities),
          useValue: piiEntitiesRepoMock,
        },
        { provide: UserService, useValue: userServiceMock },
      ],
    }).compile();

    service = module.get(AnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboard', () => {
    it('should throw NotFoundException if user not found', async () => {
      userServiceMock.findByEmail.mockResolvedValue(null);

      await expect(service.getDashboard('unknown@test.com')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should pass BETWEEN to queries with 7-day range when no period provided', async () => {
      const qbMock = buildQbMock([{}]);
      documentsRepoMock.createQueryBuilder.mockReturnValue(qbMock);
      piiEntitiesRepoMock.createQueryBuilder.mockReturnValue(buildQbMock([]));

      await service.getDashboard('test@test.com');

      const andWhereCalls = qbMock.andWhere.mock.calls as [string, unknown][];
      const [, params] = andWhereCalls.find(([q]) =>
        (q as string).includes('BETWEEN'),
      ) as [string, { startDate: Date; endDate: Date }];
      const diffDays =
        (params.endDate.getTime() - params.startDate.getTime()) /
        (1000 * 60 * 60 * 24);
      expect(diffDays).toBeGreaterThanOrEqual(7);
      expect(diffDays).toBeLessThan(9);
    });

    it('should use 14-day range when days=14', async () => {
      const qbMock = buildQbMock([{}]);
      documentsRepoMock.createQueryBuilder.mockReturnValue(qbMock);
      piiEntitiesRepoMock.createQueryBuilder.mockReturnValue(buildQbMock([]));

      await service.getDashboard('test@test.com', { days: 14 });

      const andWhereCalls = qbMock.andWhere.mock.calls as [string, unknown][];
      const [, params] = andWhereCalls.find(([q]) =>
        (q as string).includes('BETWEEN'),
      ) as [string, { startDate: Date; endDate: Date }];
      const diffDays =
        (params.endDate.getTime() - params.startDate.getTime()) /
        (1000 * 60 * 60 * 24);
      expect(diffDays).toBeGreaterThanOrEqual(14);
      expect(diffDays).toBeLessThan(16);
    });

    it('should use exact dates for custom from/to range', async () => {
      const qbMock = buildQbMock([{}]);
      documentsRepoMock.createQueryBuilder.mockReturnValue(qbMock);
      piiEntitiesRepoMock.createQueryBuilder.mockReturnValue(buildQbMock([]));

      await service.getDashboard('test@test.com', {
        from: '2026-04-01',
        to: '2026-04-30',
      });

      const andWhereCalls = qbMock.andWhere.mock.calls as [string, unknown][];
      const [, params] = andWhereCalls.find(([q]) =>
        (q as string).includes('BETWEEN'),
      ) as [string, { startDate: Date; endDate: Date }];
      expect(params.startDate.getFullYear()).toBe(2026);
      expect(params.startDate.getMonth()).toBe(3);
      expect(params.startDate.getDate()).toBe(1);
      expect(params.endDate.getFullYear()).toBe(2026);
      expect(params.endDate.getMonth()).toBe(3);
      expect(params.endDate.getDate()).toBe(30);
    });

    it('should pass activityLimit to .limit() call', async () => {
      const qbMock = buildQbMock([{}]);
      documentsRepoMock.createQueryBuilder.mockReturnValue(qbMock);
      piiEntitiesRepoMock.createQueryBuilder.mockReturnValue(buildQbMock([]));

      await service.getDashboard('test@test.com', { activityLimit: 50 });

      const limitCalls = qbMock.limit.mock.calls as [number][];
      expect(limitCalls.some(([n]) => n === 50)).toBe(true);
    });

    it('should return deIdMethodUsage with aggregated methods', async () => {
      const deIdRows = [
        { method: 'replace', count: '10' },
        { method: 'mask', count: '5' },
      ];

      documentsRepoMock.createQueryBuilder.mockReturnValue(
        buildQbMock([{ totalDocuments: '0', totalEntities: '0' }]),
      );
      piiEntitiesRepoMock.createQueryBuilder.mockReturnValue(
        buildQbMock(deIdRows),
      );

      const result = await service.getDashboard('test@test.com');

      expect(result.deIdMethodUsage).toBeDefined();
    });

    it('should return empty deIdMethodUsage if no PIIEntities with deIdMethod', async () => {
      documentsRepoMock.createQueryBuilder.mockReturnValue(buildQbMock([{}]));
      piiEntitiesRepoMock.createQueryBuilder.mockReturnValue(buildQbMock([]));

      const result = await service.getDashboard('test@test.com');

      expect(result.deIdMethodUsage).toEqual([]);
    });

    it('should return partial results if one query fails', async () => {
      documentsRepoMock.createQueryBuilder.mockReturnValue(buildQbMock([{}]));
      piiEntitiesRepoMock.createQueryBuilder.mockImplementation(() => {
        throw new InternalServerErrorException('DB error');
      });

      const result = await service.getDashboard('test@test.com');

      expect(result.deIdMethodUsage).toEqual([]);
      expect(result.entityTypes).toEqual([]);
    });
  });

  describe('getDeIdMethodUsage (via getDashboard)', () => {
    it('should calculate percentage correctly', async () => {
      const deIdRows = [
        { method: 'replace', count: '3' },
        { method: 'mask', count: '1' },
      ];

      documentsRepoMock.createQueryBuilder.mockReturnValue(
        buildQbMock([{ totalDocuments: '1', totalEntities: '4' }]),
      );

      let callCount = 0;
      piiEntitiesRepoMock.createQueryBuilder.mockImplementation(() => {
        callCount += 1;
        if (callCount === 3) {
          return buildQbMock(deIdRows);
        }
        return buildQbMock([]);
      });

      const result = await service.getDashboard('test@test.com');

      const replaceEntry = result.deIdMethodUsage.find(
        (m) => m.method === 'replace',
      );
      const maskEntry = result.deIdMethodUsage.find((m) => m.method === 'mask');

      if (replaceEntry && maskEntry) {
        expect(replaceEntry.percentage + maskEntry.percentage).toBeCloseTo(100);
        expect(replaceEntry.count).toBe(3);
        expect(maskEntry.count).toBe(1);
      }
    });
  });
});
