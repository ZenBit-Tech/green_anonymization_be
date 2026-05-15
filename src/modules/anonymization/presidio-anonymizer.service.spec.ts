import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { COMPLIANCE_FRAMEWORKS } from '@common/constants';
import PresidioAnonymizerService from './presidio-anonymizer.service';
import anonymizationConfig from './anonymization.config';
import { FRAMEWORK_PROFILES } from './constants/framework-profiles';

describe('PresidioAnonymizerService', () => {
  let service: PresidioAnonymizerService;
  let httpService: jest.Mocked<Pick<HttpService, 'post'>>;

  const configMock = {
    presidioAnalyzeUrl: 'http://analyzer',
    presidioAnonymizeUrl: 'http://anonymizer',
  };

  const analyzeResponse = {
    data: [{ entity_type: 'PERSON', start: 0, end: 10, score: 0.85 }],
  };
  const anonymizeResponse = {
    data: {
      text: '[PERSON] test',
      items: [
        {
          entity_type: 'PERSON',
          start: 0,
          end: 8,
          text: '[PERSON]',
          operator: 'replace',
        },
      ],
    },
  };

  beforeEach(async () => {
    httpService = { post: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PresidioAnonymizerService,
        { provide: HttpService, useValue: httpService },
        { provide: anonymizationConfig.KEY, useValue: configMock },
      ],
    }).compile();

    service = module.get(PresidioAnonymizerService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register for all 4 compliance frameworks', () => {
    expect(service.complianceNames).toContain(
      COMPLIANCE_FRAMEWORKS.GDPR_EU.code,
    );
    expect(service.complianceNames).toContain(
      COMPLIANCE_FRAMEWORKS.GDPR_UK.code,
    );
    expect(service.complianceNames).toContain(
      COMPLIANCE_FRAMEWORKS.FADP_CH.code,
    );
    expect(service.complianceNames).toContain(
      COMPLIANCE_FRAMEWORKS.HIPAA_US.code,
    );
    expect(service.complianceNames).toHaveLength(4);
  });

  describe('anonymize', () => {
    const setupHttpMocks = () => {
      (httpService.post as jest.Mock)
        .mockReturnValueOnce(of(analyzeResponse))
        .mockReturnValueOnce(of(anonymizeResponse));
    };

    it('should send HIPAA entity list and anonymizers to Presidio', async () => {
      setupHttpMocks();
      const profile = FRAMEWORK_PROFILES.HIPAA_US;

      await service.anonymize(
        'John Smith test',
        COMPLIANCE_FRAMEWORKS.HIPAA_US,
      );

      const analyzeBody = (httpService.post as jest.Mock).mock
        .calls[0][1] as Record<string, unknown>;
      expect(analyzeBody.entities).toEqual(profile.entities);
      expect(analyzeBody.score_threshold).toBe(profile.scoreThreshold);
      expect(analyzeBody.ad_hoc_recognizers).toBeUndefined();

      const anonymizeBody = (httpService.post as jest.Mock).mock
        .calls[1][1] as Record<string, unknown>;
      expect(anonymizeBody.anonymizers).toEqual(profile.anonymizers);
    });

    it('should send GDPR_EU entity list without ad_hoc_recognizers', async () => {
      setupHttpMocks();
      const profile = FRAMEWORK_PROFILES.GDPR_EU;

      await service.anonymize('text', COMPLIANCE_FRAMEWORKS.GDPR_EU);

      const analyzeBody = (httpService.post as jest.Mock).mock
        .calls[0][1] as Record<string, unknown>;
      expect(analyzeBody.entities).toEqual(profile.entities);
      expect(analyzeBody.ad_hoc_recognizers).toBeUndefined();
    });

    it('should include ad_hoc_recognizers for GDPR_UK', async () => {
      setupHttpMocks();

      await service.anonymize('text', COMPLIANCE_FRAMEWORKS.GDPR_UK);

      const analyzeBody = (httpService.post as jest.Mock).mock
        .calls[0][1] as Record<string, unknown>;
      expect(analyzeBody.ad_hoc_recognizers).toBeDefined();
      expect(
        (analyzeBody.ad_hoc_recognizers as unknown[]).length,
      ).toBeGreaterThan(0);
    });

    it('should include ad_hoc_recognizers for FADP_CH', async () => {
      setupHttpMocks();

      await service.anonymize('text', COMPLIANCE_FRAMEWORKS.FADP_CH);

      const analyzeBody = (httpService.post as jest.Mock).mock
        .calls[0][1] as Record<string, unknown>;
      expect(analyzeBody.ad_hoc_recognizers).toBeDefined();
      expect(
        (analyzeBody.ad_hoc_recognizers as unknown[]).length,
      ).toBeGreaterThan(0);
    });

    it('should return result with entities and operator items in metadata', async () => {
      setupHttpMocks();

      const result = await service.anonymize(
        'John Smith test',
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
      );

      expect(result.originalText).toBe('John Smith test');
      expect(result.anonymizedText).toBe('[PERSON] test');
      expect(result.metadata?.entities).toHaveLength(1);
      expect(result.metadata?.items).toHaveLength(1);
      expect(result.metadata?.items?.[0].operator).toBe('replace');
    });

    it('should throw if Presidio analysis fails', async () => {
      (httpService.post as jest.Mock).mockReturnValueOnce(
        throwError(() => new Error('network error')),
      );

      await expect(
        service.anonymize('text', COMPLIANCE_FRAMEWORKS.GDPR_EU),
      ).rejects.toThrow('Presidio analysis failed');
    });

    it('should throw if Presidio anonymization fails', async () => {
      (httpService.post as jest.Mock)
        .mockReturnValueOnce(of(analyzeResponse))
        .mockReturnValueOnce(throwError(() => new Error('anon error')));

      await expect(
        service.anonymize('text', COMPLIANCE_FRAMEWORKS.GDPR_EU),
      ).rejects.toThrow('Presidio anonymization failed');
    });

    it('should throw for unknown compliance code', async () => {
      const unknownCompliance = {
        code: 'UNKNOWN_CODE',
        name: 'Unknown',
        isActive: false,
      };

      await expect(
        service.anonymize(
          'text',
          unknownCompliance as typeof COMPLIANCE_FRAMEWORKS.GDPR_EU,
        ),
      ).rejects.toThrow('No anonymization profile found for framework: UNKNOWN_CODE');
    });
  });
});
