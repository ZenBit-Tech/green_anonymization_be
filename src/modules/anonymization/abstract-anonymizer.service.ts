import { Compliance } from '@common/constants';
import { AnonymizationResult } from './anonymization.types';

export default abstract class AbstractAnonymizerService {
  abstract complianceName: Compliance;

  abstract anonymize(text: string): Promise<AnonymizationResult>;
}
