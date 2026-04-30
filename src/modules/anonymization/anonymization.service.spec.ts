import { Test } from '@nestjs/testing';
import { Compliance } from '@common/constants';
import { DataSource } from 'typeorm';
import Documents from '@common/db/entities/documents.entity';
import AnonymizationService from './anonymization.service';
import AbstractAnonymizerService from './abstract-anonymizer.service';
import ANONYMIZER_SERVICES_TOKEN from './anonymizer-services.token';
import AnonymizerNotFoundError from './anonymizer-not-found.error';
import { AnonymizationResult } from './anonymization.types';

describe('AnonymizationService (unit)', () => {
  let service: AnonymizationService;
  let mockGdprAnonymizerService: jest.Mocked<AbstractAnonymizerService>;
  let mockHipaaAnonymizerService: jest.Mocked<AbstractAnonymizerService>;

  const mockUserService = {
    findByEmail: jest.fn(),
  };

  const mockManager = {
    create: jest.fn((_, dto) => dto),
    save: jest.fn(async (e) => e),
  };

  const mockDataSource = {
    transaction: jest.fn(async (cb) => cb(mockManager)),
  };

  const createModule = (anonymizers: AbstractAnonymizerService[] = []) =>
    Test.createTestingModule({
      providers: [
        AnonymizationService,
        { provide: ANONYMIZER_SERVICES_TOKEN, useValue: anonymizers },
        { provide: UserService, useValue: mockUserService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

  beforeEach(async () => {
    mockGdprAnonymizerService = {
      complianceName: Compliance.GDPR,
      anonymize: jest.fn(),
    } as jest.Mocked<AbstractAnonymizerService>;

    mockHipaaAnonymizerService = {
      complianceName: Compliance.HIPAA,
      anonymize: jest.fn(),
    } as jest.Mocked<AbstractAnonymizerService>;

    const module = await createModule([
      mockGdprAnonymizerService,
      mockHipaaAnonymizerService,
    ]);

    service = module.get<AnonymizationService>(AnonymizationService);

    mockUserService.findByEmail.mockResolvedValue({ uuid: 'user-1' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('anonymize', () => {
    const email = 'test@test.com';

    it('should select the correct anonymizer based on compliance', async () => {
      const gdprResultData: AnonymizationResult = {
        originalText: 'text',
        anonymizedText: 'text',
        metadata: { entities: [] },
      };
      const hipaaResultData: AnonymizationResult = {
        originalText: 'text',
        anonymizedText: 'text',
        metadata: { entities: [] },
      };

      mockGdprAnonymizerService.anonymize.mockResolvedValue(gdprResultData);
      mockHipaaAnonymizerService.anonymize.mockResolvedValue(hipaaResultData);

      const gdprResult = await service.anonymize(
        Compliance.GDPR,
        'text',
        email,
      );
      const hipaaResult = await service.anonymize(
        Compliance.HIPAA,
        'text',
        email,
      );

      expect(gdprResult.anonymizedText).toBe('text');
      expect(gdprResult.originalText).toBe('text');
      expect(hipaaResult.anonymizedText).toBe('text');
      expect(hipaaResult.originalText).toBe('text');

      expect(mockGdprAnonymizerService.anonymize).toHaveBeenCalledWith('text');

      expect(mockGdprAnonymizerService.anonymize).toHaveBeenCalledTimes(1);
      expect(mockHipaaAnonymizerService.anonymize).toHaveBeenCalledTimes(1);
    });

    it('should call only the matching anonymizer', async () => {
      const resultData: AnonymizationResult = {
        originalText: 'text',
        anonymizedText: 'text',
        metadata: { entities: [] },
      };
      mockGdprAnonymizerService.anonymize.mockResolvedValue(resultData);

      await service.anonymize(Compliance.GDPR, 'text', email);

      expect(mockGdprAnonymizerService.anonymize).toHaveBeenCalledTimes(1);
      expect(mockHipaaAnonymizerService.anonymize).not.toHaveBeenCalled();
    });

    it('should pass the exact input text to anonymizer', async () => {
      const input = 'text';
      const resultData: AnonymizationResult = {
        originalText: input,
        anonymizedText: 'text',
        metadata: { entities: [] },
      };
      mockGdprAnonymizerService.anonymize.mockResolvedValue(resultData);

      await service.anonymize(Compliance.GDPR, input, 'test@test.com');

      expect(mockGdprAnonymizerService.anonymize).toHaveBeenCalledWith(input);
    });

    it('should return the result from anonymizer', async () => {
      const resultData: AnonymizationResult = {
        originalText: 'text',
        anonymizedText: 'text',
        metadata: { entities: [] },
      };
      mockGdprAnonymizerService.anonymize.mockResolvedValue(resultData);

      mockUserService.findByEmail.mockResolvedValue({ uuid: 'user-1' });

      expect(result).toEqual(resultData);
    });

    it('should throw AnonymizerNotFoundError if compliance is invalid', async () => {
      const invalidCompliance = 'INVALID' as Compliance;

      await expect(
        service.anonymize(invalidCompliance, 'text', 'test@test.com'),
      ).rejects.toThrow(AnonymizerNotFoundError);
    });

    it('should throw if no anonymizers are registered', async () => {
      const module = await createModule([]);

      const emptyService =
        module.get<AnonymizationService>(AnonymizationService);

      await expect(
        emptyService.anonymize(Compliance.GDPR, 'text', 'test@test.com'),
      ).rejects.toThrow(AnonymizerNotFoundError);
    });

    it('should propagate errors from anonymizer service', async () => {
      const error = new Error('External service failure');

      mockGdprAnonymizerService.anonymize.mockRejectedValue(error);

      await expect(
        service.anonymize(Compliance.GDPR, 'text', 'test@test.com'),
      ).rejects.toThrow('External service failure');
    });

    it('should handle empty string input', async () => {
      const result = await service.anonymize(
        Compliance.GDPR,
        '',
        'test@test.com',
      );

      expect(result).toEqual({
        originalText: '',
        anonymizedText: '',
        metadata: { entities: [] },
      });
    });

    it('should preserve original text in result', async () => {
      const originalInput = 'John Snow lives at The Wall';
      const resultData: AnonymizationResult = {
        originalText: originalInput,
        anonymizedText: '[PERSON] lives at [LOCATION]',
        metadata: { entities: [] },
      };
      mockGdprAnonymizerService.anonymize.mockResolvedValue(resultData);

      const result = await service.anonymize(
        Compliance.GDPR,
        originalInput,
        'test@test.com',
      );
      expect(result.originalText).toBe(originalInput);
      expect(result.anonymizedText).toBe('[PERSON] lives at [LOCATION]');
    });
  });
});
