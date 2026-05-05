import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource, EntityManager } from 'typeorm';
import { Compliance, Confidence, PIIEntityType } from '@common/constants';
import AnonymizationService from '@modules/anonymization/anonymization.service';
import UserService from '@modules/user/user.service';
import User from '@/common/db/entities/user.entity';
import ProcessingService from './processing.service';
import { AnonymizationResult } from '../anonymization/anonymization.types';
import mapConfidence from './utils/mapConfidence';
import mapPIIEntityType from './utils/mapPIIEntityType';

jest.mock('./utils/mapConfidence');
jest.mock('./utils/mapPIIEntityType');

const mockedMapConfidence = jest.mocked(mapConfidence);
const mockedMapPIIEntityType = jest.mocked(mapPIIEntityType);

describe('ProcessingService', () => {
  let service: ProcessingService;

  const userServiceMock = {
    findByEmail: jest.fn<Promise<User | null>, [string]>(),
  };

  const anonymizationServiceMock = {
    anonymize: jest.fn<Promise<AnonymizationResult>, [Compliance, string]>(),
  };

  const managerMock = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const dataSourceMock = {
    transaction: jest.fn(async (cb: (m: EntityManager) => unknown) =>
      cb(managerMock as unknown as EntityManager),
    ),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        ProcessingService,
        { provide: UserService, useValue: userServiceMock },
        { provide: DataSource, useValue: dataSourceMock },
        { provide: AnonymizationService, useValue: anonymizationServiceMock },
      ],
    }).compile();

    service = module.get(ProcessingService);
  });

  describe('process', () => {
    it('returns empty result for empty input', async () => {
      const result = await service.process(
        Compliance.GDPR,
        '',
        'test@mail.com',
      );

      expect(result).toEqual({
        originalText: '',
        anonymizedText: '',
        document: null,
        piiEntities: [],
      });
    });

    it('persists document and entities', async () => {
      const user = { uuid: 'user-id' } as User;

      const anonymizationResult: AnonymizationResult = {
        originalText: 'text',
        anonymizedText: 'anon',
        metadata: {
          entities: [{ start: 0, end: 4, entity_type: 'PERSON', score: 0.9 }],
        },
      };

      userServiceMock.findByEmail.mockResolvedValue(user);
      anonymizationServiceMock.anonymize.mockResolvedValue(anonymizationResult);

      mockedMapPIIEntityType.mockReturnValue('PERSON' as PIIEntityType);
      mockedMapConfidence.mockReturnValue('HIGH' as Confidence);

      managerMock.create.mockImplementation((_, data) => ({
        id: 'id',
        ...data,
      }));
      managerMock.save.mockImplementation(async (x) => x);

      const result = await service.process(
        Compliance.GDPR,
        'text',
        'test@mail.com',
        'file.txt',
      );

      expect(managerMock.create).toHaveBeenCalled();
      expect(mockedMapPIIEntityType).toHaveBeenCalledWith('PERSON');
      expect(mockedMapConfidence).toHaveBeenCalledWith(0.9);
      expect(result.originalText).toBe('text');
      expect(result.anonymizedText).toBe('anon');
      expect(result.document).toBeDefined();
      expect(result.piiEntities).toHaveLength(1);
    });

    it('throws if user not found', async () => {
      userServiceMock.findByEmail.mockResolvedValue(null);
      anonymizationServiceMock.anonymize.mockResolvedValue({
        originalText: 'text',
        anonymizedText: 'anon',
        metadata: { entities: [] },
      });

      await expect(
        service.process(Compliance.GDPR, 'text', 'missing@mail.com'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws if metadata is missing', async () => {
      userServiceMock.findByEmail.mockResolvedValue({ uuid: 'id' } as User);
      anonymizationServiceMock.anonymize.mockResolvedValue({
        originalText: 'text',
        anonymizedText: 'anon',
      });

      await expect(
        service.process(Compliance.GDPR, 'text', 'test@mail.com'),
      ).rejects.toThrow(BadRequestException);
    });

    it('propagates anonymization errors', async () => {
      anonymizationServiceMock.anonymize.mockRejectedValue(new Error('fail'));

      await expect(
        service.process(Compliance.GDPR, 'text', 'test@mail.com'),
      ).rejects.toThrow('fail');
    });

    it('wraps transaction errors', async () => {
      userServiceMock.findByEmail.mockResolvedValue({ uuid: 'id' } as User);
      anonymizationServiceMock.anonymize.mockResolvedValue({
        originalText: 'text',
        anonymizedText: 'anon',
        metadata: { entities: [] },
      });

      managerMock.save.mockRejectedValue(new Error('db error'));

      await expect(
        service.process(Compliance.GDPR, 'text', 'test@mail.com'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
