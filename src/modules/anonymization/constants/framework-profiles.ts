import {
  PresidioAdHocRecognizer,
  PresidioOperator,
} from '../anonymization.types';

export type FrameworkProfile = {
  entities: string[];
  scoreThreshold: number;
  anonymizers: Record<string, PresidioOperator>;
  adHocRecognizers: PresidioAdHocRecognizer[];
};

const DEFAULT_SCORE_THRESHOLD = 0.5;
const HIPAA_SSN_CHARS_TO_MASK = 9;
const UK_NI_RECOGNIZER_SCORE = 0.85;
const CH_AHV_RECOGNIZER_SCORE = 0.95;

const HIPAA_ANONYMIZERS: Record<string, PresidioOperator> = {
  DEFAULT: { type: 'replace', new_value: '[OTHER]' },
  PERSON: { type: 'replace', new_value: '[PERSON]' },
  DATE_TIME: { type: 'replace', new_value: '[DATE]' },
  PHONE_NUMBER: { type: 'replace', new_value: '[PHONE_NUMBER]' },
  EMAIL_ADDRESS: { type: 'replace', new_value: '[EMAIL_ADDRESS]' },
  US_SSN: {
    type: 'mask',
    masking_char: '*',
    chars_to_mask: HIPAA_SSN_CHARS_TO_MASK,
    from_end: false,
  },
  CREDIT_CARD: { type: 'replace', new_value: '[FINANCIAL_DATA]' },
  US_BANK_NUMBER: { type: 'replace', new_value: '[FINANCIAL_DATA]' },
  MEDICAL_LICENSE: { type: 'replace', new_value: '[MEDICAL_LICENSE]' },
  US_PASSPORT: { type: 'replace', new_value: '[ID_NUMBER]' },
  US_DRIVER_LICENSE: { type: 'replace', new_value: '[ID_NUMBER]' },
  IP_ADDRESS: { type: 'replace', new_value: '[IP_ADDRESS]' },
  URL: { type: 'replace', new_value: '[URL]' },
  LOCATION: { type: 'replace', new_value: '[LOCATION]' },
};

const GDPR_ANONYMIZERS: Record<string, PresidioOperator> = {
  DEFAULT: { type: 'replace', new_value: '[OTHER]' },
  PERSON: { type: 'replace', new_value: '[PERSON]' },
  EMAIL_ADDRESS: { type: 'replace', new_value: '[EMAIL_ADDRESS]' },
  PHONE_NUMBER: { type: 'replace', new_value: '[PHONE_NUMBER]' },
  LOCATION: { type: 'replace', new_value: '[LOCATION]' },
  IP_ADDRESS: { type: 'replace', new_value: '[IP_ADDRESS]' },
  URL: { type: 'replace', new_value: '[URL]' },
  DATE_TIME: { type: 'replace', new_value: '[DATE]' },
  IBAN_CODE: { type: 'replace', new_value: '[FINANCIAL_DATA]' },
  CREDIT_CARD: { type: 'replace', new_value: '[FINANCIAL_DATA]' },
  NRP: { type: 'replace', new_value: '[SENSITIVE_CATEGORY]' },
};

const GDPR_ENTITIES = [
  'PERSON',
  'EMAIL_ADDRESS',
  'PHONE_NUMBER',
  'LOCATION',
  'IP_ADDRESS',
  'URL',
  'DATE_TIME',
  'IBAN_CODE',
  'CREDIT_CARD',
  'NRP',
];

export const FRAMEWORK_PROFILES: Record<string, FrameworkProfile> = {
  HIPAA_US: {
    entities: [
      'PERSON',
      'LOCATION',
      'DATE_TIME',
      'PHONE_NUMBER',
      'EMAIL_ADDRESS',
      'US_SSN',
      'US_PASSPORT',
      'US_DRIVER_LICENSE',
      'CREDIT_CARD',
      'IP_ADDRESS',
      'URL',
      'MEDICAL_LICENSE',
      'US_BANK_NUMBER',
    ],
    scoreThreshold: DEFAULT_SCORE_THRESHOLD,
    anonymizers: HIPAA_ANONYMIZERS,
    adHocRecognizers: [],
  },

  GDPR_EU: {
    entities: GDPR_ENTITIES,
    scoreThreshold: DEFAULT_SCORE_THRESHOLD,
    anonymizers: GDPR_ANONYMIZERS,
    adHocRecognizers: [],
  },

  GDPR_UK: {
    entities: [...GDPR_ENTITIES, 'UK_NI_NUMBER'],
    scoreThreshold: DEFAULT_SCORE_THRESHOLD,
    anonymizers: {
      ...GDPR_ANONYMIZERS,
      UK_NI_NUMBER: { type: 'replace', new_value: '[NI_NUMBER]' },
    },
    adHocRecognizers: [
      {
        name: 'UkNiRecognizer',
        supported_language: 'en',
        patterns: [
          {
            name: 'uk_ni',
            regex: '\\b[A-CEGHJ-PR-TW-Z]{2}\\d{6}[A-D]\\b',
            score: UK_NI_RECOGNIZER_SCORE,
          },
        ],
        context: ['NI', 'national insurance', 'NI number'],
        supported_entity: 'UK_NI_NUMBER',
      },
    ],
  },

  FADP_CH: {
    entities: [...GDPR_ENTITIES, 'CH_AHV_NUMBER'],
    scoreThreshold: DEFAULT_SCORE_THRESHOLD,
    anonymizers: {
      ...GDPR_ANONYMIZERS,
      CH_AHV_NUMBER: { type: 'replace', new_value: '[SWISS_ID]' },
    },
    adHocRecognizers: [
      {
        name: 'SwissAhvRecognizer',
        supported_language: 'en',
        patterns: [
          {
            name: 'ahv_number',
            regex: '\\b756\\.\\d{4}\\.\\d{4}\\.\\d{2}\\b',
            score: CH_AHV_RECOGNIZER_SCORE,
          },
        ],
        context: ['AHV', 'AVS', 'AHV-Nummer', 'AVS-Nummer'],
        supported_entity: 'CH_AHV_NUMBER',
      },
    ],
  },
};
