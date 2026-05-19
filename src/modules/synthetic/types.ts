import { PIIEntityType } from '@/common/constants';

export type GeneratedEntity = {
  entity_type: PIIEntityType;
  value: string;
};

export type ManualGenerationResult = {
  syntheticText: string;
  generatedEntities: GeneratedEntity[];
};

export type GeneratorMethod = () => string;

export type SyntheticDocument = {
  id: string;
  syntheticText: string;
  entities: GeneratedEntity[];
};

export type GenerateSyntheticDataResult = {
  syntheticDocuments: SyntheticDocument[];
};
