import { Inject } from '@nestjs/common';
import { ComplianceFrameworkConfig } from '@common/constants';
import AbstractAnonymizerService from './abstract-anonymizer.service';
import ANONYMIZER_SERVICES_TOKEN from './anonymizer-services.token';
import AnonymizerNotFoundError from './anonymizer-not-found.error';
import { AnonymizationResult } from './anonymization.types';

export default class AnonymizationService {
  private serviceMap: Map<string, AbstractAnonymizerService>;

  constructor(
    @Inject(ANONYMIZER_SERVICES_TOKEN) services: AbstractAnonymizerService[],
  ) {
    this.serviceMap = new Map(services.map((s) => [s.complianceName, s]));
  }

  async anonymize(
    compliance: ComplianceFrameworkConfig,
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

    const service = this.serviceMap.get(compliance.code);
    if (!service) {
      throw new AnonymizerNotFoundError(compliance);
    }

    const result = await service.anonymize(text);
    return result;
  }
}
