import { ComplianceFrameworkConfig } from '@common/constants';
import { AnonymizationResult } from './anonymization.types';

export default abstract class AbstractAnonymizerService {
  abstract complianceNames: string[];

  abstract anonymize(
    text: string,
    compliance: ComplianceFrameworkConfig,
  ): Promise<AnonymizationResult>;
}
