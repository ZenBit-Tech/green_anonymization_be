import { AnonymizationResult } from './anonymization.types';

export default abstract class AbstractAnonymizerService {
  abstract complianceNames: string[];

  abstract anonymize(text: string): Promise<AnonymizationResult>;
}
