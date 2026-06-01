/* eslint-disable class-methods-use-this */
import { PIIEntityType } from '@/common/constants';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PII_PLACEHOLDERS } from '@modules/anonymization/constants/framework-profiles';
import PIIEntityDto from '@modules/processing/dto/piiEntity.dto';
import formatDate from '@/common/utils/formatDate';
import {
  randomPersonNames,
  validUKNINOPrefixes,
  validUKNINOSuffixes,
  minUKNINONumber,
  maxUKNINONumber,
  randomLocations,
  randomMedicalBiologicalAttributes,
  randomMedicalClinicalEvents,
  randomMedicalDiseaseDisorders,
  randomMedicalFamilyHistory,
  randomMedicalHistory,
  randomMedicalMedications,
  randomMedicalTherapeuticProcedures,
  randomSensitiveCategories,
} from './constants';
import {
  GeneratorMethod,
  ManualGenerationResult,
  GeneratedEntity,
} from './types';
import {
  getRandomValue,
  randomNumberBetween,
  toFixedDigitString,
} from './utils';

@Injectable()
export default class ManualGenerationService {
  private readonly generatorMap: Partial<
    Record<PIIEntityType, GeneratorMethod>
  > = {
    [PIIEntityType.PERSON]: this.generatePerson.bind(this),
    [PIIEntityType.PHONE_NUMBER]: this.generatePhoneNumber.bind(this),
    [PIIEntityType.DATE_TIME]: this.generateDateTime.bind(this),
    [PIIEntityType.DATE]: this.generateDate.bind(this),
    [PIIEntityType.EMAIL_ADDRESS]: this.generateEmailAddress.bind(this),
    [PIIEntityType.IP_ADDRESS]: this.generateIpAddress.bind(this),
    [PIIEntityType.MAC_ADDRESS]: this.generateMacAddress.bind(this),
    [PIIEntityType.US_SSN]: this.generateUsSsn.bind(this),
    [PIIEntityType.UK_NI_NUMBER]: this.generateUkNino.bind(this),

    [PIIEntityType.LOCATION]: this.generateLocation.bind(this),

    [PIIEntityType.MEDICAL_CLINICAL_EVENT]:
      this.generateMedicalClinicalEvent.bind(this),

    [PIIEntityType.MEDICAL_DISEASE_DISORDER]:
      this.generateMedicalDiseaseDisorder.bind(this),

    [PIIEntityType.MEDICAL_MEDICATION]:
      this.generateMedicalMedication.bind(this),

    [PIIEntityType.MEDICAL_THERAPEUTIC_PROCEDURE]:
      this.generateMedicalTherapeuticProcedure.bind(this),

    [PIIEntityType.MEDICAL_BIOLOGICAL_ATTRIBUTE]:
      this.generateMedicalBiologicalAttribute.bind(this),

    [PIIEntityType.MEDICAL_FAMILY_HISTORY]:
      this.generateMedicalFamilyHistory.bind(this),

    [PIIEntityType.MEDICAL_HISTORY]: this.generateMedicalHistory.bind(this),

    [PIIEntityType.CH_AHV_NUMBER]: this.generateSwissAhv.bind(this),

    [PIIEntityType.CREDIT_CARD]: this.generateCreditCard.bind(this),

    [PIIEntityType.US_BANK_NUMBER]: this.generateUsBankNumber.bind(this),

    [PIIEntityType.IBAN_CODE]: this.generateIban.bind(this),

    [PIIEntityType.NRP]: this.generateSensitiveCategory.bind(this),

    [PIIEntityType.URL]: this.generateUrl.bind(this),

    [PIIEntityType.MEDICAL_LICENSE]: this.generateMedicalLicense.bind(this),

    [PIIEntityType.US_PASSPORT]: this.generateUsPassport.bind(this),

    [PIIEntityType.US_DRIVER_LICENSE]: this.generateUsDriverLicense.bind(this),
  };

  async generateManualData(
    text: string,
    piiEntities: PIIEntityDto[],
  ): Promise<ManualGenerationResult> {
    if (!text) {
      throw new InternalServerErrorException(
        'Text not found in manual generator',
      );
    }

    if (!piiEntities?.length) {
      throw new InternalServerErrorException(
        'PII entities not found in manual generator',
      );
    }

    try {
      const generatedEntities: GeneratedEntity[] = [];

      const syntheticText = piiEntities.reduce((acc, pii) => {
        const generated = this.generatePiiEntity(pii);

        if (!generated) {
          return acc;
        }

        const placeholder =
          PII_PLACEHOLDERS[pii.entityType] ?? `[${pii.entityType}]`;
        if (!acc.includes(placeholder)) {
          return acc;
        }

        generatedEntities.push({
          entity_type: pii.entityType,
          value: generated,
        });

        return acc.replace(placeholder, generated);
      }, text);

      return {
        syntheticText,
        generatedEntities,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to manually generate synthetic data, error: ${error}`,
      );
    }
  }

  private generatePiiEntity(piiEntity: PIIEntityDto): string | null {
    const generator = this.generatorMap[piiEntity.entityType];

    if (!generator) {
      return null;
    }

    return generator();
  }

  private generatePerson(): string {
    return getRandomValue(randomPersonNames);
  }

  private generatePhoneNumber(): string {
    const areaCode = Math.floor(Math.random() * 800) + 200;
    const exchange = Math.floor(Math.random() * 800) + 200;
    const lineNum = Math.floor(Math.random() * 9000) + 1000;
    return `(${areaCode}) ${exchange}-${lineNum}`;
  }

  private generateDateTime(): string {
    const maxDate = Date.now();
    const timestamp = Math.floor(Math.random() * maxDate);
    return formatDate(new Date(timestamp));
  }

  private generateDate(): string {
    return this.generateDateTime().split('T')[0];
  }

  private generateEmailAddress(domain: string = 'example.com'): string {
    const randomString = Math.random().toString(36).substring(2, 10);
    return `${randomString}@${domain}`;
  }

  private generateIpAddress(): string {
    return Array.from({ length: 4 }, () =>
      Math.floor(Math.random() * 256),
    ).join('.');
  }

  private generateMacAddress(): string {
    return Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 256)
        .toString(16)
        .padStart(2, '0')
        .toUpperCase(),
    ).join(':');
  }

  private generateUsSsn(): string {
    const pad = (num: number, size: number): string =>
      num.toString().padStart(size, '0');

    let area: number;
    do {
      area = randomNumberBetween(1, 899);
    } while (area === 666);

    const group = randomNumberBetween(1, 99);

    const serial = randomNumberBetween(1, 9999);

    const areaStr = pad(area, 3);
    const groupStr = pad(group, 2);
    const serialStr = pad(serial, 4);

    return `${areaStr}-${groupStr}-${serialStr}`;
  }

  private generateUkNino(): string {
    const prefix = getRandomValue(validUKNINOPrefixes);
    const suffix = getRandomValue(validUKNINOSuffixes);

    const randomNumber = randomNumberBetween(minUKNINONumber, maxUKNINONumber);
    const numbers = toFixedDigitString(randomNumber, 6);

    return `${prefix}${numbers}${suffix}`;
  }

  private generateLocation(): string {
    return getRandomValue(randomLocations);
  }

  private generateMedicalClinicalEvent(): string {
    return getRandomValue(randomMedicalClinicalEvents);
  }

  private generateMedicalDiseaseDisorder(): string {
    return getRandomValue(randomMedicalDiseaseDisorders);
  }

  private generateMedicalMedication(): string {
    return getRandomValue(randomMedicalMedications);
  }

  private generateMedicalTherapeuticProcedure(): string {
    return getRandomValue(randomMedicalTherapeuticProcedures);
  }

  private generateMedicalBiologicalAttribute(): string {
    return getRandomValue(randomMedicalBiologicalAttributes);
  }

  private generateMedicalFamilyHistory(): string {
    return getRandomValue(randomMedicalFamilyHistory);
  }

  private generateMedicalHistory(): string {
    return getRandomValue(randomMedicalHistory);
  }

  private generateSwissAhv(): string {
    const p1 = toFixedDigitString(randomNumberBetween(0, 9999), 4);
    const p2 = toFixedDigitString(randomNumberBetween(0, 9999), 4);
    const p3 = toFixedDigitString(randomNumberBetween(0, 99), 2);

    return `756.${p1}.${p2}.${p3}`;
  }

  private generateCreditCard(): string {
    return `${randomNumberBetween(1000, 9999)}-${randomNumberBetween(
      1000,
      9999,
    )}-${randomNumberBetween(1000, 9999)}-${randomNumberBetween(1000, 9999)}`;
  }

  private generateUsBankNumber(): string {
    return toFixedDigitString(randomNumberBetween(0, 999999999999), 12);
  }

  private generateIban(): string {
    const country = 'DE';
    const checksum = randomNumberBetween(10, 99);

    const account = toFixedDigitString(
      randomNumberBetween(0, 999999999999999),
      18,
    );

    return `${country}${checksum}${account}`;
  }

  private generateUrl(): string {
    const slug = Math.random().toString(36).substring(2, 8);

    return `https://www.${slug}.com`;
  }

  private generateMedicalLicense(): string {
    return `MED-${randomNumberBetween(100000, 999999)}`;
  }

  private generateUsPassport(): string {
    return `${randomNumberBetween(100000000, 999999999)}`;
  }

  private generateUsDriverLicense(): string {
    const letters = Array.from({ length: 1 }, () =>
      String.fromCharCode(randomNumberBetween(65, 90)),
    ).join('');

    return `${letters}${randomNumberBetween(1000000, 9999999)}`;
  }

  private generateSensitiveCategory(): string {
    return getRandomValue(randomSensitiveCategories);
  }
}
