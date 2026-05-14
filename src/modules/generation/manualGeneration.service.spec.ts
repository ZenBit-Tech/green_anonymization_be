import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';

import { PIIEntityType } from '@/common/constants';
import PIIEntities from '@/common/db/entities/PIIEntities.entity';

import ManualGenerationService from './manualGeneration.service';

describe('ManualGenerationService', () => {
  let service: ManualGenerationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ManualGenerationService],
    }).compile();

    service = module.get<ManualGenerationService>(ManualGenerationService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateManualData', () => {
    it('should throw if text is missing', async () => {
      await expect(service.generateManualData('', [])).rejects.toThrow(
        InternalServerErrorException,
      );

      await expect(service.generateManualData('', [])).rejects.toThrow(
        'Text not found in manual generator',
      );
    });

    it('should throw if pii entities are missing', async () => {
      await expect(service.generateManualData('text', [])).rejects.toThrow(
        InternalServerErrorException,
      );

      await expect(service.generateManualData('text', [])).rejects.toThrow(
        'PII entities not found in manual generator',
      );
    });

    it('should replace PERSON placeholder', async () => {
      const text = 'Patient <PERSON> arrived';

      const piiEntities = [
        {
          entityType: PIIEntityType.PERSON,
        },
      ] as PIIEntities[];

      const result = await service.generateManualData(text, piiEntities);

      expect(result.syntheticText).not.toContain('<PERSON>');

      expect(result.generatedEntities).toHaveLength(1);

      expect(result.generatedEntities[0].type).toBe(PIIEntityType.PERSON);

      expect(result.generatedEntities[0].value).toBeTruthy();
    });

    it('should replace placeholders only once per entity', async () => {
      const text = '<PERSON> and another <PERSON> appeared';

      const piiEntities = [
        {
          entityType: PIIEntityType.PERSON,
        },
      ] as PIIEntities[];

      const result = await service.generateManualData(text, piiEntities);

      expect(result.syntheticText).toContain('<PERSON>');

      expect(result.syntheticText).not.toBe(text);
    });

    it('should preserve generated entity ordering', async () => {
      const piiEntities = [
        {
          entityType: PIIEntityType.PERSON,
        },
        {
          entityType: PIIEntityType.EMAIL_ADDRESS,
        },
      ] as PIIEntities[];

      const result = await service.generateManualData(
        '<PERSON> <EMAIL_ADDRESS>',
        piiEntities,
      );

      expect(result.generatedEntities).toHaveLength(2);

      expect(result.generatedEntities[0].type).toBe(PIIEntityType.PERSON);

      expect(result.generatedEntities[1].type).toBe(
        PIIEntityType.EMAIL_ADDRESS,
      );
    });

    it('should ignore unsupported entity types', async () => {
      const piiEntities = [
        {
          entityType: PIIEntityType.LOCATION,
        },
      ] as PIIEntities[];

      const result = await service.generateManualData(
        'Location: <LOCATION>',
        piiEntities,
      );

      expect(result.syntheticText).toContain('<LOCATION>');

      expect(result.generatedEntities).toEqual([]);
    });

    it('should generate valid phone number format', async () => {
      const piiEntities = [
        {
          entityType: PIIEntityType.PHONE_NUMBER,
        },
      ] as PIIEntities[];

      const result = await service.generateManualData(
        'Phone: <PHONE_NUMBER>',
        piiEntities,
      );

      expect(result.syntheticText).toMatch(/\(\d{3}\) \d{3}-\d{4}/);
    });

    it('should generate valid email format', async () => {
      const piiEntities = [
        {
          entityType: PIIEntityType.EMAIL_ADDRESS,
        },
      ] as PIIEntities[];

      const result = await service.generateManualData(
        'Email: <EMAIL_ADDRESS>',
        piiEntities,
      );

      expect(result.syntheticText).toMatch(/[a-z0-9]+@example\.com/);
    });

    it('should generate valid IP address format', async () => {
      const piiEntities = [
        {
          entityType: PIIEntityType.IP_ADDRESS,
        },
      ] as PIIEntities[];

      const result = await service.generateManualData(
        'IP: <IP_ADDRESS>',
        piiEntities,
      );

      expect(result.syntheticText).toMatch(/\b\d{1,3}(\.\d{1,3}){3}\b/);
    });

    it('should generate valid MAC address format', async () => {
      const piiEntities = [
        {
          entityType: PIIEntityType.MAC_ADDRESS,
        },
      ] as PIIEntities[];

      const result = await service.generateManualData(
        'MAC: <MAC_ADDRESS>',
        piiEntities,
      );

      expect(result.syntheticText).toMatch(/\b([0-9A-F]{2}:){5}[0-9A-F]{2}\b/);
    });

    it('should generate valid US SSN format', async () => {
      const piiEntities = [
        {
          entityType: PIIEntityType.US_SSN,
        },
      ] as PIIEntities[];

      const result = await service.generateManualData(
        'SSN: <US_SSN>',
        piiEntities,
      );

      expect(result.syntheticText).toMatch(/\d{3}-\d{2}-\d{4}/);
    });

    it('should generate valid UK NINO format', async () => {
      const piiEntities = [
        {
          entityType: PIIEntityType.UK_NINO,
        },
      ] as PIIEntities[];

      const result = await service.generateManualData(
        'NINO: <UK_NINO>',
        piiEntities,
      );

      expect(result.syntheticText).toMatch(/[A-Z]{2}\d{6}[A-Z]/);
    });

    it('should generate valid ISO datetime string', async () => {
      const piiEntities = [
        {
          entityType: PIIEntityType.DATE_TIME,
        },
      ] as PIIEntities[];

      const result = await service.generateManualData(
        'Date: <DATE_TIME>',
        piiEntities,
      );

      const generatedDate = result.generatedEntities[0].value;

      expect(() => new Date(generatedDate).toISOString()).not.toThrow();
    });
  });
});
