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
import {
  AnonymizationEntity,
  AnonymizationResult,
} from './anonymization.types';

export default class PresidioAnonymizerService extends AbstractAnonymizerService {
  complianceName = Compliance.GDPR;

  constructor(
    @Inject(anonymizationConfig.KEY)
    private readonly config: AnonymizationConfig,
    private readonly httpService: HttpService,
  ) {
    super();
  }

  async anonymize(text: string): Promise<AnonymizationResult> {
    let analyzerResults = await this.analyze(text);
    analyzerResults = analyzerResults.map(
      (item): AnonymizationEntity => ({
        start: item.start,
        end: item.end,
        entity_type: item.entity_type,
        score: item.score,
      }),
    );

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          this.config.presidioAnonymizeUrl.concat(
            PRESIDIO_ANONYMIZER_ANONYMIZE_ENDPOINT,
          ),
          {
            text,
            analyzer_results: analyzerResults,
          },
        ),
      );

      const anonymizedText = response.data.text;

      const result: AnonymizationResult = {
        originalText: text,
        anonymizedText,
        metadata: {
          entities: analyzerResults,
        },
      };

      return result;
    } catch (error) {
      throw new Error('Presidio anonymization failed');
    }
  }

  private async analyze(text: string): Promise<AnonymizationEntity[]> {
    // TODO: Detect language using https://github.com/nitotm/efficient-language-detector-js

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          this.config.presidioAnalyzeUrl.concat(
            PRESIDIO_ANONYMIZER_ANALYZE_ENDPOINT,
          ),
          {
            text,
            language: 'en',
          },
        ),
      );
      return response.data;
    } catch (error) {
      throw new Error('Presidio analysis failed');
    }
  }
}
