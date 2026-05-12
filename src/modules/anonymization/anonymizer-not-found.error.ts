import { ComplianceFrameworkConfig } from '@/common/constants';

export default class AnonymizerNotFoundError extends Error {
  constructor(compliance: ComplianceFrameworkConfig) {
    super(`No anonymizer found for compliance: ${compliance.name}`);
    this.name = 'AnonymizerNotFoundError';
  }
}
