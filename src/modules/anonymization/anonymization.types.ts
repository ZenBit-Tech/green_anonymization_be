export type PresidioAnonymizedItem = {
  start: number;
  end: number;
  entity_type: string;
  text: string;
  operator: string;
};

export type AnonymizationMetadata = {
  entities: AnonymizationEntity[];
  items?: PresidioAnonymizedItem[];
};

export type AnonymizationEntity = {
  start: number;
  end: number;
  entity_type: string;
  score: number;
};

export type AnonymizationResult = {
  originalText: string;
  anonymizedText: string;
  metadata?: AnonymizationMetadata;
};

export type PresidioOperator =
  | { type: 'replace'; new_value: string }
  | { type: 'redact' }
  | {
      type: 'mask';
      masking_char: string;
      chars_to_mask: number;
      from_end: boolean;
    }
  | { type: 'hash'; hash_type?: 'md5' | 'sha256' | 'sha512' };

export type PresidioPattern = {
  name: string;
  regex: string;
  score: number;
};

export type PresidioAdHocRecognizer = {
  name: string;
  supported_language: string;
  patterns: PresidioPattern[];
  context?: string[];
  supported_entity: string;
};
