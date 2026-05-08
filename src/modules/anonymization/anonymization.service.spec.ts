import { Test, TestingModule } from '@nestjs/testing';
import {
  COMPLIANCE_FRAMEWORKS,
  ComplianceFrameworkConfig,
} from '@/common/constants';
import AnonymizationService from './anonymization.service';
import AbstractAnonymizerService from './abstract-anonymizer.service';
import ANONYMIZER_SERVICES_TOKEN from './anonymizer-services.token';
import AnonymizerNotFoundError from './anonymizer-not-found.error';
import { AnonymizationResult } from './anonymization.types';

describe('AnonymizationService (unit)', () => {
  let service: AnonymizationService;
  let mockGdprAnonymizerService: jest.Mocked<AbstractAnonymizerService>;
  let mockHipaaAnonymizerService: jest.Mocked<AbstractAnonymizerService>;

  beforeEach(async () => {
    mockGdprAnonymizerService = {
      complianceName: COMPLIANCE_FRAMEWORKS.GDPR_EU.code,
      anonymize: jest.fn(),
    } as jest.Mocked<AbstractAnonymizerService>;

    mockHipaaAnonymizerService = {
      complianceName: COMPLIANCE_FRAMEWORKS.HIPAA_US.code,
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
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        'text',
      );
      const hipaaResult = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.HIPAA_US,
        'text',
      );

      expect(gdprResult.anonymizedText).toBe('text');
      expect(gdprResult.originalText).toBe('text');
      expect(hipaaResult.anonymizedText).toBe('text');
      expect(hipaaResult.originalText).toBe('text');

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

      await service.anonymize(COMPLIANCE_FRAMEWORKS.GDPR_EU, 'text');

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

      await service.anonymize(COMPLIANCE_FRAMEWORKS.GDPR_EU, input);

      expect(mockGdprAnonymizerService.anonymize).toHaveBeenCalledWith(input);
    });

    it('should return the result from anonymizer', async () => {
      const resultData: AnonymizationResult = {
        originalText: 'text',
        anonymizedText: 'text',
        metadata: { entities: [] },
      };
      mockGdprAnonymizerService.anonymize.mockResolvedValue(resultData);

      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        'text',
      );

      expect(result).toEqual(resultData);
    });

    it('should throw AnonymizerNotFoundError if compliance is invalid', async () => {
      const invalidCompliance = {
        code: 'INVALID',
        name: 'INVALID_NAME',
        description: 'An invalid framework for testing',
        entityTypesCount: 0,
        isActive: false,
      } as ComplianceFrameworkConfig;

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
        emptyService.anonymize(COMPLIANCE_FRAMEWORKS.GDPR_EU, 'text'),
      ).rejects.toThrow(AnonymizerNotFoundError);
    });

    it('should propagate errors from anonymizer service', async () => {
      const error = new Error('External service failure');

      mockGdprAnonymizerService.anonymize.mockRejectedValue(error);

      await expect(
        service.anonymize(COMPLIANCE_FRAMEWORKS.GDPR_EU, 'text'),
      ).rejects.toThrow('External service failure');
    });

    it('should handle empty string input', async () => {
      const result = await service.anonymize(COMPLIANCE_FRAMEWORKS.GDPR_EU, '');

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
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        originalInput,
      );

      expect(result.originalText).toBe(originalInput);
      expect(result.anonymizedText).toBe('[PERSON] lives at [LOCATION]');
    });
  });
});
