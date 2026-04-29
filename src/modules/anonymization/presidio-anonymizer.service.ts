import { Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  Compliance,
  PRESIDIO_ANONYMIZER_ANALYZE_ENDPOINT,
  PRESIDIO_ANONYMIZER_ANONYMIZE_ENDPOINT,
} from '@common/constants';
import AbstractAnonymizerService from './abstract-anonymizer.service';
import anonymizationConfig from './anonymization.config';
import type { AnonymizationConfig } from './anonymization.config';
import { PresidioEntity, PresidioResult } from './types/presidioResults';

export default class PresidioAnonymizerService extends AbstractAnonymizerService {
  complianceName = Compliance.GDPR;

  constructor(
    @Inject(anonymizationConfig.KEY)
    private readonly config: AnonymizationConfig,
    private readonly httpService: HttpService,
  ) {
    super();
  }

  async anonymize(text: string): Promise<PresidioResult> {
    const entities = await this.analyze(text);

    const response = await firstValueFrom(
      this.httpService.post(
        this.config.presidioAnonymizeUrl.concat(
          PRESIDIO_ANONYMIZER_ANONYMIZE_ENDPOINT,
        ),
        {
          text,
          analyzer_results: entities,
        },
      ),
    );

    return {
      originalText: text,
      anonymizedText: response.data.text,
      entities,
    };
  }

  private async analyze(text: string): Promise<PresidioEntity[]> {
    const response = await firstValueFrom(
      this.httpService.post<unknown[]>(
        this.config.presidioAnalyzeUrl.concat(
          PRESIDIO_ANONYMIZER_ANALYZE_ENDPOINT,
        ),
        {
          text,
          language: 'en',
        },
      ),
    );

    return response.data.map((e) => {
      const entity = e as {
        entity_type: string;
        start: number;
        end: number;
        score: number;
      };

      return {
        entity_type: entity.entity_type,
        start: entity.start,
        end: entity.end,
        score: entity.score,
      };
    });
  }
}
