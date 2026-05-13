import { Test, TestingModule } from '@nestjs/testing';

import { COMPLIANCE_FRAMEWORKS, ComplianceFramework } from '@common/constants';
import AnonymizationService from '@modules/anonymization/anonymization.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import anonymizationConfig from '../../../src/modules/anonymization/anonymization.config';
import PresidioAnonymizerService from '../../../src/modules/anonymization/presidio-anonymizer.service';
import ANONYMIZER_SERVICES_TOKEN from '../../../src/modules/anonymization/anonymizer-services.token';
import runLocationTestsGDPR from './run-location-tests.gdpr';
import runPersonTestsGDPR from './run-person-tests.gdpr';
import runBiometricTestsGDPR from './run-biometric-tests.gdpr';
import runContactTestsGDPR from './run-contact-tests.gdpr';
import runDateTimeTestsGDPR from './run-date-time-tests.gdpr';
import runFinancialTestsGDPR from './run-financial-tests.gdpr';
import runIdentifierTestsGDPR from './run-identifier-tests.gdpr';
import runMedicalTestsGDPR from './run-medical-tests.gdpr';
import runOnlineIdentifierTestsGDPR from './run-online-identifier-tests.gdpr';
import runOrganizationTestsGDPR from './run-organization-tests.gdpr';

describe('Anonymization (integration)', () => {
  let module: TestingModule;
  let service: AnonymizationService;

  const textShort =
    'Contact: Dr. Johnson at Johns Hopkins Medical Center, phone: (410) 555-1234, license #MD-789456.';
  const textLong =
    'Patient: petro@example.com, SSN: 555-55-5555, DOB: 01/15/1985. Diagnosed with Type 2 Diabetes Mellitus and hypertension on 03/20/2023. Current medications include Metformin 500mg twice daily and Lisinopril 10mg once daily. Contact: Dr. Johnson at Johns Hopkins Medical Center, phone: (410) 555-1234, license #MD-789456.';

  const textArrayShort = [
    textShort,
    textShort,
    textShort,
    textShort,
    textShort,
  ];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const textArrayLong = [textLong, textLong, textLong, textLong, textLong];

  const testIdempotency = (compliance: ComplianceFramework, text: string) => {
    it('should idempotently anonymize same input across multiple calls', async () => {
      const result1 = await service.anonymize(compliance, text);
      const result2 = await service.anonymize(compliance, text);
      const result3 = await service.anonymize(compliance, text);

      expect(result1.anonymizedText).toBe(result2.anonymizedText);
      expect(result2.anonymizedText).toBe(result3.anonymizedText);
    });
  };

  const testPerformance = (
    compliance: ComplianceFramework,
    textArray: string[],
  ) => {
    it('should handle rapid successive requests', async () => {
      const startTime = performance.now();

      const results = await Promise.all(
        textArray.map((singleText) =>
          service.anonymize(compliance, singleText),
        ),
      );

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(results).toHaveLength(textArray.length);
      expect(executionTime).toBeLessThan(4000);
      results.forEach((result) => {
        expect(result).toHaveProperty('anonymizedText');
        expect(result).toHaveProperty('metadata');
      });
    });
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigModule.forFeature(anonymizationConfig), HttpModule],
      providers: [
        AnonymizationService,
        PresidioAnonymizerService,
        {
          provide: ANONYMIZER_SERVICES_TOKEN,
          useFactory: (
            presidioAnonymizerService: PresidioAnonymizerService,
          ) => {
            return [presidioAnonymizerService];
          },
          inject: [PresidioAnonymizerService],
        },
      ],
      exports: [AnonymizationService],
    }).compile();

    service = module.get<AnonymizationService>(AnonymizationService);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('HIPAA anonymization', () => {
    it('should handle HIPAA compliance', async () => {
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.HIPAA_US,
        textShort,
      );
      expect(result).toBeDefined();
    });

    testIdempotency(COMPLIANCE_FRAMEWORKS.HIPAA_US, textLong);
    testPerformance(COMPLIANCE_FRAMEWORKS.HIPAA_US, textArrayShort);
  });

  describe('GDPR anonymization', () => {
    it('should handle GDPR compliance', async () => {
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        textShort,
      );
      expect(result).toBeDefined();
    });

    it('should anonymize FREE TEXT correctly', async () => {
      const input =
        'In my notes I might write something like “Hey this is Alex from Cherkasy, email me at alex.petrenko@gmail.com if needed,” mixed with random comments, typos, or extra phrases that include names, locations, and numbers all tangled together.';

      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );

      const regex =
        /^In my notes I might write something like “Hey this is <[^>]+> from <[^>]+>, email me at <[^>]+> if needed,” mixed with random comments, typos, or extra phrases that include names, locations, and numbers all tangled together\.$/;

      expect(result.anonymizedText).toMatch(regex);
    });

    it('should anonymize: Tokyo', async () => {
      const input = 'I am from Tokyo.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^I am from <[^>]+>\.$/);
    });

    it('should anonymize: São Paulo', async () => {
      const input = 'Currently in São Paulo.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Currently in <[^>]+>\.$/);
    });

    it('should anonymize: Nairobi', async () => {
      const input = 'Living near Nairobi.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(/^Living near <[^>]+>\.$/);
    });

    it('should anonymize: Berlin to Munich', async () => {
      const input = 'I moved from Berlin to Munich.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^I moved from <[^>]+> to <[^>]+>\.$/,
      );
    });

    it('should anonymize: Alex Paris and alex@mail.com', async () => {
      const input = 'Hi I am Alex from Paris, email alex@mail.com.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Hi I am <[^>]+> from <[^>]+>, email <[^>]+>\.$/,
      );
    });

    it('should anonymize: John London and john123@yahoo.com', async () => {
      const input = 'Contact John in London at john123@yahoo.com.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Contact <[^>]+> in <[^>]+> at <[^>]+>\.$/,
      );
    });

    it('should anonymize: Maria Madrid and maria@gmail.com', async () => {
      const input = 'User Maria in Madrid uses maria@gmail.com.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^User <[^>]+> in <[^>]+> uses <[^>]+>\.$/,
      );
    });

    it('should anonymize: Ahmed Dubai and ahmed@outlook.com', async () => {
      const input = 'Reach Ahmed from Dubai via ahmed@outlook.com.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Reach <[^>]+> from <[^>]+> via <[^>]+>\.$/,
      );
    });

    it('should anonymize: Wei Shanghai and wei@qq.com', async () => {
      const input = 'Ping Wei in Shanghai at wei@qq.com.';
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.GDPR_EU,
        input,
      );
      expect(result.anonymizedText).toMatch(
        /^Ping <[^>]+> in <[^>]+> at <[^>]+>\.$/,
      );
    });

    runOrganizationTestsGDPR(() => service);
    runOnlineIdentifierTestsGDPR(() => service);
    runMedicalTestsGDPR(() => service);
    runIdentifierTestsGDPR(() => service);
    runFinancialTestsGDPR(() => service);
    runDateTimeTestsGDPR(() => service);
    runContactTestsGDPR(() => service);
    runBiometricTestsGDPR(() => service);
    runLocationTestsGDPR(() => service);
    runPersonTestsGDPR(() => service);

    testIdempotency(COMPLIANCE_FRAMEWORKS.GDPR_EU, textLong);
    testPerformance(COMPLIANCE_FRAMEWORKS.GDPR_EU, textArrayShort);
  });

  describe('FADP anonymization', () => {
    it('should handle FADP compliance', async () => {
      const result = await service.anonymize(
        COMPLIANCE_FRAMEWORKS.FADP_CH,
        textShort,
      );
      expect(result).toBeDefined();
    });

    testIdempotency(COMPLIANCE_FRAMEWORKS.FADP_CH, textLong);
    testPerformance(COMPLIANCE_FRAMEWORKS.FADP_CH, textArrayShort);
  });
});
