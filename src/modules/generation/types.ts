import { PIIEntityType } from '@/common/constants';

export type GeneratedEntity = {
  type: PIIEntityType;
  value: string;
};

export type ManualGenerationResult = {
  syntheticText: string;
  generatedEntities: GeneratedEntity[];
};

export type GeneratorMethod = () => string;
