import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';

import { PIIEntityType } from '@/common/constants';
import PIIEntityDto from '@modules/processing/dto/piiEntity.dto';
import { PII_PLACEHOLDERS } from '@modules/anonymization/constants/framework-profiles';

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

  const createEntity = (entityType: PIIEntityType): PIIEntityDto =>
    ({
      entityType,
    }) as PIIEntityDto;

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
      const text = `Patient ${PII_PLACEHOLDERS[PIIEntityType.PERSON]} arrived`;

      const result = await service.generateManualData(text, [
        createEntity(PIIEntityType.PERSON),
      ]);

      expect(result.syntheticText).not.toContain(
        PII_PLACEHOLDERS[PIIEntityType.PERSON],
      );

      expect(result.generatedEntities).toHaveLength(1);

      expect(result.generatedEntities[0].entity_type).toBe(
        PIIEntityType.PERSON,
      );

      expect(result.generatedEntities[0].value).toBeTruthy();
    });

    it('should replace placeholders only once per entity', async () => {
      const placeholder = PII_PLACEHOLDERS[PIIEntityType.PERSON];

      const text = `${placeholder} and another ${placeholder} appeared`;

      const result = await service.generateManualData(text, [
        createEntity(PIIEntityType.PERSON),
      ]);

      expect(result.syntheticText).toContain(placeholder);

      expect(result.syntheticText).not.toBe(text);
    });

    it('should preserve generated entity ordering', async () => {
      const result = await service.generateManualData(
        `${PII_PLACEHOLDERS[PIIEntityType.PERSON]} ${PII_PLACEHOLDERS[PIIEntityType.EMAIL_ADDRESS]}`,
        [
          createEntity(PIIEntityType.PERSON),
          createEntity(PIIEntityType.EMAIL_ADDRESS),
        ],
      );

      expect(result.generatedEntities).toHaveLength(2);

      expect(result.generatedEntities[0].entity_type).toBe(
        PIIEntityType.PERSON,
      );

      expect(result.generatedEntities[1].entity_type).toBe(
        PIIEntityType.EMAIL_ADDRESS,
      );
    });

    it('should generate valid phone number format', async () => {
      const result = await service.generateManualData(
        `Phone: ${PII_PLACEHOLDERS[PIIEntityType.PHONE_NUMBER]}`,
        [createEntity(PIIEntityType.PHONE_NUMBER)],
      );

      expect(result.syntheticText).toMatch(/\(\d{3}\) \d{3}-\d{4}/);
    });

    it('should generate valid email format', async () => {
      const result = await service.generateManualData(
        `Email: ${PII_PLACEHOLDERS[PIIEntityType.EMAIL_ADDRESS]}`,
        [createEntity(PIIEntityType.EMAIL_ADDRESS)],
      );

      expect(result.syntheticText).toMatch(/[a-z0-9]+@example\.com/);
    });

    it('should generate valid IP address format', async () => {
      const result = await service.generateManualData(
        `IP: ${PII_PLACEHOLDERS[PIIEntityType.IP_ADDRESS]}`,
        [createEntity(PIIEntityType.IP_ADDRESS)],
      );

      expect(result.syntheticText).toMatch(/\b\d{1,3}(\.\d{1,3}){3}\b/);
    });

    it('should generate valid MAC address format', async () => {
      const result = await service.generateManualData(
        `MAC: ${PII_PLACEHOLDERS[PIIEntityType.MAC_ADDRESS]}`,
        [createEntity(PIIEntityType.MAC_ADDRESS)],
      );

      expect(result.syntheticText).toMatch(/\b([0-9A-F]{2}:){5}[0-9A-F]{2}\b/);
    });

    it('should generate valid US SSN format', async () => {
      const result = await service.generateManualData(
        `SSN: ${PII_PLACEHOLDERS[PIIEntityType.US_SSN]}`,
        [createEntity(PIIEntityType.US_SSN)],
      );

      expect(result.syntheticText).toMatch(/\d{3}-\d{2}-\d{4}/);
    });

    it('should generate valid UK NI number format', async () => {
      const result = await service.generateManualData(
        `NINO: ${PII_PLACEHOLDERS[PIIEntityType.UK_NI_NUMBER]}`,
        [createEntity(PIIEntityType.UK_NI_NUMBER)],
      );

      expect(result.syntheticText).toMatch(/^[^]*[A-Z]{2}\d{6}[A-Z][^]*$/);
    });

    it('should generate valid Swiss AHV number format', async () => {
      const result = await service.generateManualData(
        `AHV: ${PII_PLACEHOLDERS[PIIEntityType.CH_AHV_NUMBER]}`,
        [createEntity(PIIEntityType.CH_AHV_NUMBER)],
      );

      expect(result.syntheticText).toMatch(/756\.\d{4}\.\d{4}\.\d{2}/);
    });

    it('should generate valid credit card format', async () => {
      const result = await service.generateManualData(
        `CC: ${PII_PLACEHOLDERS[PIIEntityType.CREDIT_CARD]}`,
        [createEntity(PIIEntityType.CREDIT_CARD)],
      );

      expect(result.syntheticText).toMatch(/\d{4}-\d{4}-\d{4}-\d{4}/);
    });

    it('should generate valid US bank number format', async () => {
      const result = await service.generateManualData(
        `BANK: ${PII_PLACEHOLDERS[PIIEntityType.US_BANK_NUMBER]}`,
        [createEntity(PIIEntityType.US_BANK_NUMBER)],
      );

      expect(result.syntheticText).toMatch(/\d{12}/);
    });

    it('should generate valid IBAN format', async () => {
      const result = await service.generateManualData(
        `IBAN: ${PII_PLACEHOLDERS[PIIEntityType.IBAN_CODE]}`,
        [createEntity(PIIEntityType.IBAN_CODE)],
      );

      expect(result.syntheticText).toMatch(/DE\d{2}\d{18}/);
    });

    it('should generate valid URL format', async () => {
      const result = await service.generateManualData(
        `URL: ${PII_PLACEHOLDERS[PIIEntityType.URL]}`,
        [createEntity(PIIEntityType.URL)],
      );

      expect(result.syntheticText).toMatch(/https:\/\/www\.[a-z0-9]+\.com/);
    });

    it('should generate valid medical license format', async () => {
      const result = await service.generateManualData(
        `License: ${PII_PLACEHOLDERS[PIIEntityType.MEDICAL_LICENSE]}`,
        [createEntity(PIIEntityType.MEDICAL_LICENSE)],
      );

      expect(result.syntheticText).toMatch(/MED-\d{6}/);
    });

    it('should generate valid US passport format', async () => {
      const result = await service.generateManualData(
        `Passport: ${PII_PLACEHOLDERS[PIIEntityType.US_PASSPORT]}`,
        [createEntity(PIIEntityType.US_PASSPORT)],
      );

      expect(result.syntheticText).toMatch(/\b\d{9}\b/);
    });

    it('should generate valid US driver license format', async () => {
      const result = await service.generateManualData(
        `DL: ${PII_PLACEHOLDERS[PIIEntityType.US_DRIVER_LICENSE]}`,
        [createEntity(PIIEntityType.US_DRIVER_LICENSE)],
      );

      expect(result.syntheticText).toMatch(/[A-Z]\d{7}/);
    });

    it.each([
      PIIEntityType.LOCATION,
      PIIEntityType.MEDICAL_CLINICAL_EVENT,
      PIIEntityType.MEDICAL_DISEASE_DISORDER,
      PIIEntityType.MEDICAL_MEDICATION,
      PIIEntityType.MEDICAL_THERAPEUTIC_PROCEDURE,
      PIIEntityType.MEDICAL_BIOLOGICAL_ATTRIBUTE,
      PIIEntityType.MEDICAL_FAMILY_HISTORY,
      PIIEntityType.MEDICAL_HISTORY,
      PIIEntityType.NRP,
    ])('should generate replacement for %s', async (entityType) => {
      const result = await service.generateManualData(
        `Value: ${PII_PLACEHOLDERS[entityType]}`,
        [createEntity(entityType)],
      );

      expect(result.generatedEntities).toHaveLength(1);

      expect(result.generatedEntities[0].entity_type).toBe(entityType);

      expect(result.generatedEntities[0].value).toBeTruthy();

      expect(result.syntheticText).not.toContain(PII_PLACEHOLDERS[entityType]);
    });

    it('should ignore unsupported entity types', async () => {
      const text = 'Value: [OTHER]';

      const result = await service.generateManualData(text, [
        createEntity(PIIEntityType.OTHER),
      ]);

      expect(result.syntheticText).toBe(text);

      expect(result.generatedEntities).toHaveLength(0);
    });
  });
});
