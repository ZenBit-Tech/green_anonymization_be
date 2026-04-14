import { Test, TestingModule } from '@nestjs/testing';
import { Compliance } from '@common/constants';
import AnonymizationService from './anonymization.service';
import AbstractAnonymizerService from './abstract-anonymizer.service';
import ANONYMIZER_SERVICES_TOKEN from './anonymizer-services.token';
import AnonymizerNotFoundError from './anonymizer-not-found.error';

describe('AnonymizationService (unit)', () => {
  let service: AnonymizationService;
  let mockGdprAnonymizerService: jest.Mocked<AbstractAnonymizerService>;
  let mockHipaaAnonymizerService: jest.Mocked<AbstractAnonymizerService>;

  beforeEach(async () => {
    mockGdprAnonymizerService = {
      complianceName: Compliance.GDPR,
      anonymize: jest.fn(),
    } as jest.Mocked<AbstractAnonymizerService>;

    mockHipaaAnonymizerService = {
      complianceName: Compliance.HIPAA,
      anonymize: jest.fn(),
    } as jest.Mocked<AbstractAnonymizerService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnonymizationService,
        {
          provide: ANONYMIZER_SERVICES_TOKEN,
          useValue: [mockGdprAnonymizerService, mockHipaaAnonymizerService],
        },
      ],
    }).compile();

    service = module.get<AnonymizationService>(AnonymizationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('anonymize', () => {
    it('should select the correct anonymizer based on compliance', async () => {
      mockGdprAnonymizerService.anonymize.mockResolvedValue('gdpr-result');
      mockHipaaAnonymizerService.anonymize.mockResolvedValue('hipaa-result');

      const gdprResult = await service.anonymize(Compliance.GDPR, 'text');
      const hipaaResult = await service.anonymize(Compliance.HIPAA, 'text');

      expect(gdprResult.anonymizedText).toBe('gdpr-result');
      expect(gdprResult.originalText).toBe('text');
      expect(hipaaResult.anonymizedText).toBe('hipaa-result');
      expect(hipaaResult.originalText).toBe('text');

      expect(mockGdprAnonymizerService.anonymize).toHaveBeenCalledTimes(1);
      expect(mockHipaaAnonymizerService.anonymize).toHaveBeenCalledTimes(1);
    });

    it('should call only the matching anonymizer', async () => {
      mockGdprAnonymizerService.anonymize.mockResolvedValue('result');

      await service.anonymize(Compliance.GDPR, 'text');

      expect(mockGdprAnonymizerService.anonymize).toHaveBeenCalledTimes(1);
      expect(mockHipaaAnonymizerService.anonymize).not.toHaveBeenCalled();
    });

    it('should pass the exact input text to anonymizer', async () => {
      const input = 'original text';
      mockGdprAnonymizerService.anonymize.mockResolvedValue('result');

      await service.anonymize(Compliance.GDPR, input);

      expect(mockGdprAnonymizerService.anonymize).toHaveBeenCalledWith(input);
    });

    it('should return the result from anonymizer', async () => {
      mockGdprAnonymizerService.anonymize.mockResolvedValue('processed');

      const result = await service.anonymize(Compliance.GDPR, 'text');

      expect(result).toEqual({
        originalText: 'text',
        anonymizedText: 'processed',
      });
    });

    it('should throw AnonymizerNotFoundError if compliance is invalid', async () => {
      const invalidCompliance = 'INVALID' as Compliance;

      await expect(
        service.anonymize(invalidCompliance, 'text'),
      ).rejects.toThrow(AnonymizerNotFoundError);
    });

    it('should throw if no anonymizers are registered', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AnonymizationService,
          {
            provide: ANONYMIZER_SERVICES_TOKEN,
            useValue: [],
          },
        ],
      }).compile();

      const emptyService =
        module.get<AnonymizationService>(AnonymizationService);

      await expect(
        emptyService.anonymize(Compliance.GDPR, 'text'),
      ).rejects.toThrow(AnonymizerNotFoundError);
    });

    it('should propagate errors from anonymizer service', async () => {
      const error = new Error('External service failure');

      mockGdprAnonymizerService.anonymize.mockRejectedValue(error);

      await expect(service.anonymize(Compliance.GDPR, 'text')).rejects.toThrow(
        'External service failure',
      );
    });

    it('should handle empty string input', async () => {
      const result = await service.anonymize(Compliance.GDPR, '');

      expect(result).toEqual({
        originalText: '',
        anonymizedText: '',
      });
    });

    it('should preserve original text in result', async () => {
      const originalInput = 'John Doe lives in New York';
      mockGdprAnonymizerService.anonymize.mockResolvedValue(
        '[PERSON] lives in [LOCATION]',
      );

      const result = await service.anonymize(Compliance.GDPR, originalInput);

      expect(result.originalText).toBe(originalInput);
      expect(result.anonymizedText).toBe('[PERSON] lives in [LOCATION]');
    });
  });
});
