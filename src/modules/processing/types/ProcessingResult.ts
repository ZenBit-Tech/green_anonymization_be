import Documents from '@common/db/entities/documents.entity';
import PIIEntities from '@/common/db/entities/PIIEntities.entity';

export type ProcessingResult = {
  originalText: string;
  anonymizedText: string;
  document: Documents;
  piiEntities: PIIEntities[];
};
