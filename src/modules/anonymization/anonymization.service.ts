import { Inject } from '@nestjs/common';
import { Compliance } from '@common/constants';
import AbstractAnonymizerService from './abstract-anonymizer.service';
import ANONYMIZER_SERVICES_TOKEN from './anonymizer-services.token';
import AnonymizerNotFoundError from './anonymizer-not-found.error';
import { AnonymizationResult } from './anonymization.types';

export default class AnonymizationService {
  private serviceMap: Map<Compliance, AbstractAnonymizerService>;

  constructor(
    @Inject(ANONYMIZER_SERVICES_TOKEN) services: AbstractAnonymizerService[],
  ) {
    this.serviceMap = new Map();
    services.forEach((s) =>
      s.complianceNames.forEach((c) => this.serviceMap.set(c, s)),
    );
  }

  async anonymize(
    complianceName: Compliance,
    text: string,
  ): Promise<AnonymizationResult> {
    if (text === '') {
      const emptyAnonymizationResult: AnonymizationResult = {
        originalText: '',
        anonymizedText: '',
        metadata: {
          entities: [],
        },
      };
      return emptyAnonymizationResult;
    }

    const service = this.serviceMap.get(complianceName);

    if (!service) {
      throw new AnonymizerNotFoundError(complianceName);
    }

    const result = await service.anonymize(text);

    return result;
  }
}
