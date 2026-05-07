import { Test, TestingModule } from '@nestjs/testing';
import { Compliance } from '@common/constants';
import AnonymizationService from '@modules/anonymization/anonymization.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import anonymizationConfig from '../../../src/modules/anonymization/anonymization.config';
import PresidioAnonymizerService from '../../../src/modules/anonymization/presidio-anonymizer.service';
import ANONYMIZER_SERVICES_TOKEN from '../../../src/modules/anonymization/anonymizer-services.token';
import runLocationTestsGDPR from './run-location-tests.gdpr';
import runPersonTestsGDPR from './run-person-tests.gdpr';
import runBiometricTestsGDPR from './run-biometric-tests.gdpr';

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

  const testIdempotency = (compliance: Compliance, text: string) => {
    it('should idempotently anonymize same input across multiple calls', async () => {
      const result1 = await service.anonymize(compliance, text);
      const result2 = await service.anonymize(compliance, text);
      const result3 = await service.anonymize(compliance, text);

      expect(result1.anonymizedText).toBe(result2.anonymizedText);
      expect(result2.anonymizedText).toBe(result3.anonymizedText);
    });
  };

  const testPerformance = (compliance: Compliance, textArray: string[]) => {
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
      const result = await service.anonymize(Compliance.HIPAA, textShort);
      expect(result).toBeDefined();
    });

    testIdempotency(Compliance.HIPAA, textLong);
    testPerformance(Compliance.HIPAA, textArrayShort);
  });

  describe('GDPR anonymization', () => {
    it('should handle GDPR compliance', async () => {
      const result = await service.anonymize(Compliance.GDPR, textShort);
      expect(result).toBeDefined();
    });

    it('should anonymize ORGANIZATION correctly', async () => {
      const input =
        "I work at Global Tech Solutions LLC, or sometimes we shorten it to GTS, though legally it's registered as Global Tech Solutions Limited, and internally we refer to it as “the Group” or just “Head Office.”";

      const result = await service.anonymize(Compliance.GDPR, input);

      const regex =
        /^I work at <[^>]+>, or sometimes we shorten it to <[^>]+>, though legally it's registered as <[^>]+>, and internally we refer to it as “<[^>]+>” or just “<[^>]+>.”$/;

      expect(result.anonymizedText).toMatch(regex);
    });

    it('should anonymize DATE/TIME correctly', async () => {
      const input =
        'I was born on January 5th, 2001, or 05/01/2001 depending on the format, sometime around 3:45 PM, though my records also show 15:45 or even just “early afternoon Q1 2001.”';

      const result = await service.anonymize(Compliance.GDPR, input);

      const regex =
        /^I was born on <[^>]+>, or <[^>]+> depending on the format, sometime <[^>]+>, though my records also show <[^>]+> or even just “<[^>]+>.”$/;

      expect(result.anonymizedText).toMatch(regex);
    });

    it('should anonymize CONTACT correctly', async () => {
      const input =
        'You can reach me at alex.petrenko@gmail.com, or a.petrenko@workmail.co, and sometimes I still use my old address alexp01@yahoo.com, while my phone could be +380501234567, (050) 123-45-67, or even written as 0501234567.';

      const result = await service.anonymize(Compliance.GDPR, input);

      const regex =
        /^You can reach me at <[^>]+>, or <[^>]+>, and sometimes I still use my old address <[^>]+>, while my phone could be <[^>]+>, <[^>]+>, or even written as <[^>]+>\.$/;

      expect(result.anonymizedText).toMatch(regex);
    });

    it('should anonymize IDENTIFIERS correctly', async () => {
      const input =
        'My passport number is AB123456, though some forms list it as AB-123456 or just 123456 with prefix AB, and my internal ID is 000987654, sometimes shortened to 987654 or written as ID#987654.';

      const result = await service.anonymize(Compliance.GDPR, input);

      const regex =
        /^My passport number is <[^>]+>, though some forms list it as <[^>]+> or just <[^>]+> with prefix <[^>]+>, and my internal ID is <[^>]+>, sometimes shortened to <[^>]+> or written as <[^>]+>\.$/;

      expect(result.anonymizedText).toMatch(regex);
    });

    it('should anonymize FINANCIAL correctly', async () => {
      const input =
        'My card number used to be 1234 5678 9012 3456, sometimes written as 1234567890123456, and occasionally only shown as **** **** **** 3456, while my bank account might appear as UA123456789012345678901234567 or shortened in different systems.';

      const result = await service.anonymize(Compliance.GDPR, input);

      const regex =
        /^My card number used to be <[^>]+>, sometimes written as <[^>]+>, and occasionally only shown as <[^>]+>, while my bank account might appear as <[^>]+> or shortened in different systems\.$/;

      expect(result.anonymizedText).toMatch(regex);
    });

    it('should anonymize ONLINE IDENTIFIERS correctly', async () => {
      const input =
        'My IP could be 192.168.1.1 locally, or 203.0.113.45 externally, sometimes logged as 203.0.113.xxx, and my device might appear as iPhone-13-Alex, Alex’s iPhone, or device ID A1B2C3D4.';

      const result = await service.anonymize(Compliance.GDPR, input);

      const regex =
        /^My IP could be <[^>]+> locally, or <[^>]+> externally, sometimes logged as <[^>]+>, and my device might appear as <[^>]+>, <[^>]+>, or device ID <[^>]+>\.$/;

      expect(result.anonymizedText).toMatch(regex);
    });

    it('should anonymize MEDICAL DATA correctly', async () => {
      const input =
        'My records mention Type 1 diabetes, sometimes written as T1D, insulin-dependent diabetes mellitus, or just “chronic condition,” with notes about blood glucose levels like 5.6 mmol/L or “within normal range.”';

      const result = await service.anonymize(Compliance.GDPR, input);

      const regex =
        /^My records mention <[^>]+>, sometimes written as <[^>]+>, <[^>]+>, or just “<[^>]+>,” with notes about blood glucose levels like <[^>]+> or “<[^>]+>.”$/;

      expect(result.anonymizedText).toMatch(regex);
    });

    it('should anonymize FREE TEXT correctly', async () => {
      const input =
        'In my notes I might write something like “Hey this is Alex from Cherkasy, email me at alex.petrenko@gmail.com if needed,” mixed with random comments, typos, or extra phrases that include names, locations, and numbers all tangled together.';

      const result = await service.anonymize(Compliance.GDPR, input);

      const regex =
        /^In my notes I might write something like “Hey this is <[^>]+> from <[^>]+>, email me at <[^>]+> if needed,” mixed with random comments, typos, or extra phrases that include names, locations, and numbers all tangled together\.$/;

      expect(result.anonymizedText).toMatch(regex);
    });

    it('should anonymize: Tokyo', async () => {
      const input = 'I am from Tokyo.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^I am from <[^>]+>\.$/);
    });

    it('should anonymize: São Paulo', async () => {
      const input = 'Currently in São Paulo.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^Currently in <[^>]+>\.$/);
    });

    it('should anonymize: Nairobi', async () => {
      const input = 'Living near Nairobi.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^Living near <[^>]+>\.$/);
    });

    it('should anonymize: Berlin to Munich', async () => {
      const input = 'I moved from Berlin to Munich.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^I moved from <[^>]+> to <[^>]+>\.$/,
      );
    });

    it('should anonymize: Google', async () => {
      const input = 'I work at Google.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^I work at <[^>]+>\.$/);
    });

    it('should anonymize: Tata Consultancy Services', async () => {
      const input = 'Employed by Tata Consultancy Services.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^Employed by <[^>]+>\.$/);
    });

    it('should anonymize: Aramco (Arabic organization)', async () => {
      const input = 'Working for Aramco.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^Working for <[^>]+>\.$/);
    });

    it('should anonymize: NHS UK', async () => {
      const input = 'At NHS UK currently.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^At <[^>]+> currently\.$/);
    });

    it('should anonymize: ACME Corp', async () => {
      const input = 'Freelancing via ACME Corp.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^Freelancing via <[^>]+>\.$/);
    });

    it('should anonymize: 11:59 PM', async () => {
      const input = 'Meeting at 11:59 PM.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^Meeting at <[^>]+>\.$/);
    });

    it('should anonymize: 12/31/2024', async () => {
      const input = 'Meeting on 12/31/2024.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^Meeting on <[^>]+>\.$/);
    });

    it('should anonymize: CET format (31.12.2024 23:59 CET)', async () => {
      const input = 'Event: 31.12.2024 23:59 CET.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^Event: <[^>]+>\.$/);
    });

    it('should anonymize: ISO datetime (2024-12-31T23:59:00+09:00)', async () => {
      const input = 'Scheduled for 2024-12-31T23:59:00+09:00.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^Scheduled for <[^>]+>\.$/);
    });

    it('should anonymize: Hijri date (1446-09-01)', async () => {
      const input = 'Date is 1446-09-01 (Hijri).';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^Date is <[^>]+> \(Hijri\)\.$/);
    });

    it('should anonymize: UTC offset time (10:30 UTC+5:30)', async () => {
      const input = 'Happening at 10:30 UTC+5:30.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^Happening at <[^>]+>\.$/);
    });

    it('should anonymize: Gmail alias (test.user+alias@gmail.com)', async () => {
      const input = 'Email me at test.user+alias@gmail.com.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^Email me at <[^>]+>\.$/);
    });

    it('should anonymize: Proton email (user_name123@proton.me)', async () => {
      const input = 'Reach out: user_name123@proton.me';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^Reach out: <[^>]+>$/);
    });

    it('should anonymize: US phone (+1 (555) 123-4567)', async () => {
      const input = 'Phone: +1 (555) 123-4567';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^Phone: <[^>]+>$/);
    });

    it('should anonymize: UK phone (0044 20 7946 0958)', async () => {
      const input = 'Alt: 0044 20 7946 0958';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^Alt: <[^>]+>$/);
    });

    it('should anonymize: Telegram username (@cool_user_99)', async () => {
      const input = 'Telegram: @cool_user_99';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^Telegram: <[^>]+>$/);
    });

    it('should anonymize: ID (AB-123456)', async () => {
      const input = 'ID: AB-123456.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^ID: <[^>]+>\.$/);
    });

    it('should anonymize: reference number (XYZ-999-888)', async () => {
      const input = 'Ref number (XYZ-999-888).';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^Ref number \(<[^>]+>\)\.$/);
    });

    it('should anonymize: user ID (ID:778899)', async () => {
      const input = 'User ID [ID:778899].';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^User ID \[<[^>]+>\]\.$/);
    });

    it('should anonymize: code (12-34-56-78)', async () => {
      const input = 'Code: 12-34-56-78.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^Code: <[^>]+>\.$/);
    });

    it('should anonymize: token ({A1B2-C3D4})', async () => {
      const input = 'Token {A1B2-C3D4}.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^Token \{<[^>]+>\}\.$/);
    });

    it('should anonymize: credit card (4111 1111 8294 1111)', async () => {
      const input = 'Card: 4111 1111 8294 1111.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^Card: <[^>]+>\.$/);
    });

    it('should anonymize: IBAN (DE89 3704 0044 0532 0130 00)', async () => {
      const input = 'IBAN: DE89 3704 0044 0532 0130 00.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^IBAN: <[^>]+>\.$/);
    });

    it('should anonymize: account number (001-234567-89)', async () => {
      const input = 'Account No: 001-234567-89.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^Account No: <[^>]+>\.$/);
    });

    it('should anonymize: SWIFT (BOFAUS3NXXX)', async () => {
      const input = 'SWIFT: BOFAUS3NXXX.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^SWIFT: <[^>]+>\.$/);
    });

    it('should anonymize: not sufficiently masked card (**** 99** 8893 1234)', async () => {
      const input = 'Card ending **** 99** 8893 1234.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^Card ending <[^>]+>\.$/);
    });

    it('should anonymize: public IP (8.8.8.8)', async () => {
      const input = 'IP is 8.8.8.8.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^IP is <[^>]+>\.$/);
    });

    it('should anonymize: private IP (192.168.0.1)', async () => {
      const input = 'Local IP 192.168.0.1 used.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^Local IP <[^>]+> used\.$/);
    });

    it('should anonymize: device (Samsung-Galaxy-S21)', async () => {
      const input = 'Device: Samsung-Galaxy-S21.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^Device: <[^>]+>\.$/);
    });

    it('should anonymize: IPv6 (fe80::1ff:fe23:4567:890a)', async () => {
      const input = 'Session from fe80::1ff:fe23:4567:890a.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^Session from <[^>]+>\.$/);
    });

    it('should anonymize: user agent ID (UA-123456-7)', async () => {
      const input = 'User agent ID UA-123456-7.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^User agent ID <[^>]+>\.$/);
    });

    it('should anonymize: diabetes', async () => {
      const input = 'Patient has diabetes.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^Patient has <[^>]+>\.$/);
    });

    it('should anonymize: hypertension stage 2', async () => {
      const input = 'Diagnosed with hypertension stage 2.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^Diagnosed with <[^>]+>\.$/);
    });

    it('should anonymize: COVID-19 positive', async () => {
      const input = 'Condition: COVID-19 positive.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^Condition: <[^>]+>\.$/);
    });

    it('should anonymize: glucose (7.8 mmol/L)', async () => {
      const input = 'Glucose level 7.8 mmol/L.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^Glucose level <[^>]+>\.$/);
    });

    it('should anonymize: asthma', async () => {
      const input = 'History of asthma.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(/^History of <[^>]+>\.$/);
    });

    it('should anonymize: Alex Paris and alex@mail.com', async () => {
      const input = 'Hi I am Alex from Paris, email alex@mail.com.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^Hi I am <[^>]+> from <[^>]+>, email <[^>]+>\.$/,
      );
    });

    it('should anonymize: John London and john123@yahoo.com', async () => {
      const input = 'Contact John in London at john123@yahoo.com.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^Contact <[^>]+> in <[^>]+> at <[^>]+>\.$/,
      );
    });

    it('should anonymize: Maria Madrid and maria@gmail.com', async () => {
      const input = 'User Maria in Madrid uses maria@gmail.com.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^User <[^>]+> in <[^>]+> uses <[^>]+>\.$/,
      );
    });

    it('should anonymize: Ahmed Dubai and ahmed@outlook.com', async () => {
      const input = 'Reach Ahmed from Dubai via ahmed@outlook.com.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^Reach <[^>]+> from <[^>]+> via <[^>]+>\.$/,
      );
    });

    it('should anonymize: Wei Shanghai and wei@qq.com', async () => {
      const input = 'Ping Wei in Shanghai at wei@qq.com.';
      const result = await service.anonymize(Compliance.GDPR, input);
      expect(result.anonymizedText).toMatch(
        /^Ping <[^>]+> in <[^>]+> at <[^>]+>\.$/,
      );
    });

    runBiometricTestsGDPR(() => service);
    runLocationTestsGDPR(() => service);
    runPersonTestsGDPR(() => service);

    testIdempotency(Compliance.GDPR, textLong);
    testPerformance(Compliance.GDPR, textArrayShort);
  });

  describe('FADP anonymization', () => {
    it('should handle FADP compliance', async () => {
      const result = await service.anonymize(Compliance.FADP, textShort);
      expect(result).toBeDefined();
    });

    testIdempotency(Compliance.FADP, textLong);
    testPerformance(Compliance.FADP, textArrayShort);
  });
});
