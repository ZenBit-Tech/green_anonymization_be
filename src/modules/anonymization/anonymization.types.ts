export type AnonymizationMetadata = {
  entities: AnonymizationEntity[];
};

export type AnonymizationEntity = {
  start: number;
  end: number;
  entity_type: string;
  score: number;
  analysis_explanation: string | null;
};

export type AnonymizationResult = {
  originalText: string;
  anonymizedText: string;
  metadata?: AnonymizationMetadata;
};
