import { Test } from '@nestjs/testing';
import { Compliance } from '@common/constants';
import { DataSource } from 'typeorm';
import Documents from '@common/db/entities/documents.entity';
import AnonymizationService from './anonymization.service';
import AbstractAnonymizerService from './abstract-anonymizer.service';
import ANONYMIZER_SERVICES_TOKEN from './anonymizer-services.token';
import AnonymizerNotFoundError from './anonymizer-not-found.error';
import UserService from '../user/user.service';

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
      mockUserService.findByEmail.mockResolvedValue({ uuid: 'user-1' });

      mockGdprAnonymizerService.anonymize.mockResolvedValue({
        originalText: 'text',
        anonymizedText: 'gdpr-result',
        entities: [],
      });
      mockHipaaAnonymizerService.anonymize.mockResolvedValue({
        originalText: 'text',
        anonymizedText: 'hipaa-result',
        entities: [],
      });

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

      expect(gdprResult.anonymizedText).toBe('gdpr-result');
      expect(gdprResult.originalText).toBe('text');
      expect(hipaaResult.anonymizedText).toBe('hipaa-result');
      expect(hipaaResult.originalText).toBe('text');

      expect(mockGdprAnonymizerService.anonymize).toHaveBeenCalledWith('text');

      expect(mockGdprAnonymizerService.anonymize).toHaveBeenCalledTimes(1);
      expect(mockHipaaAnonymizerService.anonymize).toHaveBeenCalledTimes(1);
    });

    it('should call only the matching anonymizer', async () => {
      mockUserService.findByEmail.mockResolvedValue({ uuid: 'user-1' });

      mockGdprAnonymizerService.anonymize.mockResolvedValue({
        originalText: 'text',
        anonymizedText: 'result',
        entities: [],
      });

      await service.anonymize(Compliance.GDPR, 'text', email);

      expect(mockGdprAnonymizerService.anonymize).toHaveBeenCalledTimes(1);
      expect(mockHipaaAnonymizerService.anonymize).not.toHaveBeenCalled();
    });

    it('should pass the exact input text to anonymizer', async () => {
      const input = 'original text';
      mockGdprAnonymizerService.anonymize.mockResolvedValue({
        originalText: input,
        anonymizedText: 'result',
        entities: [],
      });

      await service.anonymize(Compliance.GDPR, input, 'test@test.com');

      expect(mockGdprAnonymizerService.anonymize).toHaveBeenCalledWith(input);
    });

    it('should return the result from anonymizer', async () => {
      const input = 'text';

      mockUserService.findByEmail.mockResolvedValue({ uuid: 'user-1' });

      mockGdprAnonymizerService.anonymize.mockResolvedValue({
        originalText: input,
        anonymizedText: 'processed',
        entities: [],
      });

      const result = await service.anonymize(
        Compliance.GDPR,
        input,
        'test@test.com',
      );

      expect(result.originalText).toBe('text');
      expect(result.anonymizedText).toBe('processed');

      expect(result.document).toBeDefined();
      expect(result.entities).toEqual([]);
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
        document: null as unknown as Documents,
        entities: [],
      });
    });

    it('should preserve original text in result', async () => {
      const originalInput = 'John Doe lives in New York';
      mockGdprAnonymizerService.anonymize.mockResolvedValue({
        originalText: originalInput,
        anonymizedText: '[PERSON] lives in [LOCATION]',
        entities: [],
      });

      const result = await service.anonymize(
        Compliance.GDPR,
        originalInput,
        'test@test.com',
      );
      expect(result.originalText).toBe(originalInput);
      expect(result.anonymizedText).toBe('[PERSON] lives in [LOCATION]');
    });
  });
});
