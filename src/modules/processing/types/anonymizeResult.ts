import Documents from '@common/db/entities/documents.entity';
import Entities from '@common/db/entities/entities.entity';

export type ProcessingResult = {
  originalText: string;
  anonymizedText: string;
  document: Documents;
  entities: Entities[];
};
