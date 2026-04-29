export type PresidioEntity = {
  entity_type: string;
  start: number;
  end: number;
  score: number;
};

export type PresidioResult = {
  originalText: string;
  anonymizedText: string;
  entities: PresidioEntity[];
};

export type PresidioAnalyzeResult = PresidioEntity[];
