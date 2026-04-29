import { Compliance } from '@common/constants';
import { PresidioResult } from './types/presidioResults';

export default abstract class AbstractAnonymizerService {
  abstract complianceName: Compliance;

  abstract anonymize(text: string): Promise<PresidioResult>;
}
