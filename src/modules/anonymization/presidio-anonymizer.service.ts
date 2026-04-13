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

export default class PresidioAnonymizerService extends AbstractAnonymizerService {
  complianceName = Compliance.GDPR;

  constructor(
    @Inject(anonymizationConfig.KEY)
    private readonly config: AnonymizationConfig,
    private readonly httpService: HttpService,
  ) {
    super();
  }

  async anonymize(text: string): Promise<string> {
    const analyzerResults = await this.analyze(text);

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
      return response.data.text;
    } catch (error) {
      throw new Error('Presidio anonymization failed');
    }
  }

  private async analyze(text: string): Promise<string> {
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
