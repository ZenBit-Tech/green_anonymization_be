import { Inject } from '@nestjs/common';
import { Compliance } from '@common/constants';
import AbstractAnonymizerService from './abstract-anonymizer.service';
import ANONYMIZER_SERVICES_TOKEN from './anonymizer-services.token';
import AnonymizerNotFoundError from './anonymizer-not-found.error';

export type AnonymizationResult = {
  originalText: string;
  anonymizedText: string;
  // TODO: Add custom metadata type, once the required anonymization entity-related fields are defined
  // metadata: AnonymizationMetadata;
};

export default class AnonymizationService {
  private serviceMap: Map<Compliance, AbstractAnonymizerService>;

  constructor(
    @Inject(ANONYMIZER_SERVICES_TOKEN) services: AbstractAnonymizerService[],
  ) {
    this.serviceMap = new Map(services.map((s) => [s.complianceName, s]));
  }

  async anonymize(
    complianceName: Compliance,
    text: string,
  ): Promise<AnonymizationResult> {
    const service = this.serviceMap.get(complianceName);

    if (!service) {
      throw new AnonymizerNotFoundError(complianceName);
    }

    const anonymizedText = await service.anonymize(text);
    const anonymizationResult: AnonymizationResult = {
      originalText: text,
      anonymizedText,
    };
    return anonymizationResult;
  }
}
