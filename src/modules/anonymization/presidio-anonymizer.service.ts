import { Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  COMPLIANCE_FRAMEWORKS,
  ComplianceFrameworkConfig,
  PRESIDIO_ANONYMIZER_ANALYZE_ENDPOINT,
  PRESIDIO_ANONYMIZER_ANONYMIZE_ENDPOINT,
} from '@common/constants';
import AbstractAnonymizerService from './abstract-anonymizer.service';
import anonymizationConfig from './anonymization.config';
import type { AnonymizationConfig } from './anonymization.config';
import {
  AnonymizationEntity,
  AnonymizationResult,
  AnonymizedEntityItem,
} from './anonymization.types';
import {
  FRAMEWORK_PROFILES,
  FrameworkProfile,
} from './constants/framework-profiles';

export default class PresidioAnonymizerService extends AbstractAnonymizerService {
  complianceNames: string[] = Object.values(COMPLIANCE_FRAMEWORKS).map(
    (f) => f.code,
  );

  constructor(
    @Inject(anonymizationConfig.KEY)
    private readonly config: AnonymizationConfig,
    private readonly httpService: HttpService,
  ) {
    super();
  }

  async anonymize(
    text: string,
    compliance: ComplianceFrameworkConfig,
  ): Promise<AnonymizationResult> {
    const profile = PresidioAnonymizerService.getProfile(compliance.code);

    const analyzerResults = await this.analyze(text, profile);

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          this.config.presidioAnonymizeUrl.concat(
            PRESIDIO_ANONYMIZER_ANONYMIZE_ENDPOINT,
          ),
          {
            text,
            analyzer_results: analyzerResults,
            anonymizers: profile.anonymizers,
          },
        ),
      );

      return {
        originalText: text,
        anonymizedText: response.data.text as string,
        metadata: {
          entities: analyzerResults,
          items: (response.data.items ?? []) as AnonymizedEntityItem[],
        },
      };
    } catch {
      throw new Error('Presidio anonymization failed');
    }
  }

  private async analyze(
    text: string,
    profile: FrameworkProfile,
  ): Promise<AnonymizationEntity[]> {
    try {
      const body: Record<string, unknown> = {
        text,
        language: 'en',
        entities: profile.entities,
        score_threshold: profile.scoreThreshold,
      };

      if (profile.adHocRecognizers.length > 0) {
        body.ad_hoc_recognizers = profile.adHocRecognizers;
      }

      const response = await firstValueFrom(
        this.httpService.post(
          this.config.presidioAnalyzeUrl.concat(
            PRESIDIO_ANONYMIZER_ANALYZE_ENDPOINT,
          ),
          body,
        ),
      );
      return response.data as AnonymizationEntity[];
    } catch {
      throw new Error('Presidio analysis failed');
    }
  }

  private static getProfile(code: string): FrameworkProfile {
    const profile = FRAMEWORK_PROFILES[code];
    if (!profile) {
      throw new Error(`No anonymization profile found for framework: ${code}`);
    }
    return profile;
  }
}
