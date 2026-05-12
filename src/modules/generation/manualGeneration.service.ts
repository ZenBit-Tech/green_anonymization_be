import { PIIEntityType } from '@/common/constants';
import PIIEntities from '@/common/db/entities/PIIEntities.entity';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  validUKNINOPrefixes,
  validUKNINOSuffixes,
  minUKNINONumber,
  maxUKNINONumber,
  randomPersonNames,
} from './constants';
import {
  randomNumberBetween,
  getRandomValue,
  toFixedDigitString,
} from './utils';

type GeneratedEntity = {
  type: PIIEntityType;
  value: string;
};

type ManualGenerationResult = {
  syntheticText: string;
  generatedEntities: GeneratedEntity[];
};

type GeneratorMethod = () => string;

@Injectable()
export default class ManualGenerationService {
  private readonly generatorMap: Partial<
    Record<PIIEntityType, GeneratorMethod>
  > = {
    [PIIEntityType.PERSON]: this.generatePerson.bind(this),
    [PIIEntityType.PHONE_NUMBER]: this.generatePhoneNumber.bind(this),
    [PIIEntityType.DATE_TIME]: this.generateDateTime.bind(this),
    [PIIEntityType.EMAIL_ADDRESS]: this.generateEmailAddress.bind(this),
    [PIIEntityType.IP_ADDRESS]: this.generateIpAddress.bind(this),
    [PIIEntityType.MAC_ADDRESS]: this.generateMacAddress.bind(this),
    [PIIEntityType.US_SSN]: this.generateUsSsn.bind(this),
    [PIIEntityType.UK_NINO]: this.generateUkNino.bind(this),
  };

  async generateManualData(
    text: string,
    piiEntities: PIIEntities[],
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

        generatedEntities.push({
          type: pii.entityType,
          value: generated,
        });

        return this.replacePlaceholderOnce(acc, pii.entityType, generated);
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

  // eslint-disable-next-line class-methods-use-this
  private replacePlaceholderOnce(
    text: string,
    entityType: PIIEntityType,
    replacement: string,
  ): string {
    const placeholder = `<${entityType}>`;

    return text.replace(placeholder, replacement);
  }

  private generatePiiEntity(piiEntity: PIIEntities): string | null {
    const generator = this.generatorMap[piiEntity.entityType];

    if (!generator) {
      return null;
    }

    return generator();
  }

  // eslint-disable-next-line class-methods-use-this
  private generatePerson(): string {
    return getRandomValue(randomPersonNames);
  }

  // eslint-disable-next-line class-methods-use-this
  private generatePhoneNumber(): string {
    const areaCode = Math.floor(Math.random() * 800) + 200;
    const exchange = Math.floor(Math.random() * 800) + 200;
    const lineNum = Math.floor(Math.random() * 9000) + 1000;
    return `(${areaCode}) ${exchange}-${lineNum}`;
  }

  // eslint-disable-next-line class-methods-use-this
  private generateDateTime(): string {
    const maxDate = Date.now();
    const timestamp = Math.floor(Math.random() * maxDate);
    return new Date(timestamp).toISOString();
  }

  // eslint-disable-next-line class-methods-use-this
  private generateEmailAddress(domain: string = 'example.com'): string {
    const randomString = Math.random().toString(36).substring(2, 10);
    return `${randomString}@${domain}`;
  }

  // eslint-disable-next-line class-methods-use-this
  private generateIpAddress(): string {
    return Array.from({ length: 4 }, () =>
      Math.floor(Math.random() * 256),
    ).join('.');
  }

  // eslint-disable-next-line class-methods-use-this
  private generateMacAddress(): string {
    return Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 256)
        .toString(16)
        .padStart(2, '0')
        .toUpperCase(),
    ).join(':');
  }

  // eslint-disable-next-line class-methods-use-this
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

  // eslint-disable-next-line class-methods-use-this
  private generateUkNino(): string {
    const prefix = getRandomValue(validUKNINOPrefixes);
    const suffix = getRandomValue(validUKNINOSuffixes);

    const randomNumber = randomNumberBetween(minUKNINONumber, maxUKNINONumber);
    const numbers = toFixedDigitString(randomNumber, 6);

    return `${prefix}${numbers}${suffix}`;
  }
}
