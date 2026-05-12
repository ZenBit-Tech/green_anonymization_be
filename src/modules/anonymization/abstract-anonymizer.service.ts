import { AnonymizationResult } from './anonymization.types';

export default abstract class AbstractAnonymizerService {
  abstract complianceName: string;

  abstract anonymize(text: string): Promise<AnonymizationResult>;
}
