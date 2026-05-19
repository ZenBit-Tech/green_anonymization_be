import { PIIEntityType } from '@common/constants';
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

export const PII_PLACEHOLDERS: Record<PIIEntityType, string> = {
  [PIIEntityType.PERSON]: '[PERSON]',
  [PIIEntityType.DATE_TIME]: '[DATE_TIME]',
  [PIIEntityType.DATE]: '[DATE]',
  [PIIEntityType.EMAIL_ADDRESS]: '[EMAIL_ADDRESS]',
  [PIIEntityType.PHONE_NUMBER]: '[PHONE_NUMBER]',
  [PIIEntityType.LOCATION]: '[LOCATION]',
  [PIIEntityType.IP_ADDRESS]: '[IP_ADDRESS]',
  [PIIEntityType.MAC_ADDRESS]: '[MAC_ADDRESS]',
  [PIIEntityType.US_SSN]: '[US_SSN]',
  [PIIEntityType.UK_NI_NUMBER]: '[NI_NUMBER]',
  [PIIEntityType.CH_AHV_NUMBER]: '[SWISS_ID]',
  [PIIEntityType.MEDICAL_CLINICAL_EVENT]: '[MEDICAL_CLINICAL_EVENT]',
  [PIIEntityType.MEDICAL_DISEASE_DISORDER]: '[MEDICAL_DISEASE_DISORDER]',
  [PIIEntityType.MEDICAL_MEDICATION]: '[MEDICAL_MEDICATION]',
  [PIIEntityType.MEDICAL_THERAPEUTIC_PROCEDURE]:
    '[MEDICAL_THERAPEUTIC_PROCEDURE]',
  [PIIEntityType.MEDICAL_BIOLOGICAL_ATTRIBUTE]:
    '[MEDICAL_BIOLOGICAL_ATTRIBUTE]',
  [PIIEntityType.MEDICAL_FAMILY_HISTORY]: '[MEDICAL_FAMILY_HISTORY]',
  [PIIEntityType.MEDICAL_HISTORY]: '[MEDICAL_HISTORY]',
  [PIIEntityType.CREDIT_CARD]: '[FINANCIAL_DATA]',
  [PIIEntityType.US_BANK_NUMBER]: '[FINANCIAL_DATA]',
  [PIIEntityType.IBAN_CODE]: '[FINANCIAL_DATA]',
  [PIIEntityType.MEDICAL_LICENSE]: '[MEDICAL_LICENSE]',
  [PIIEntityType.US_PASSPORT]: '[ID_NUMBER]',
  [PIIEntityType.US_DRIVER_LICENSE]: '[ID_NUMBER]',
  [PIIEntityType.NRP]: '[SENSITIVE_CATEGORY]',
  [PIIEntityType.URL]: '[URL]',
  [PIIEntityType.OTHER]: '[OTHER]',
};

const HIPAA_ANONYMIZERS: Record<string, PresidioOperator> = {
  DEFAULT: {
    type: 'replace',
    new_value: PII_PLACEHOLDERS[PIIEntityType.OTHER],
  },
  PERSON: {
    type: 'replace',
    new_value: PII_PLACEHOLDERS[PIIEntityType.PERSON],
  },
  DATE_TIME: {
    type: 'replace',
    new_value: PII_PLACEHOLDERS[PIIEntityType.DATE],
  },
  PHONE_NUMBER: {
    type: 'replace',
    new_value: PII_PLACEHOLDERS[PIIEntityType.PHONE_NUMBER],
  },
  EMAIL_ADDRESS: {
    type: 'replace',
    new_value: PII_PLACEHOLDERS[PIIEntityType.EMAIL_ADDRESS],
  },
  US_SSN: {
    type: 'mask',
    masking_char: '*',
    chars_to_mask: HIPAA_SSN_CHARS_TO_MASK,
    from_end: false,
  },
  CREDIT_CARD: {
    type: 'replace',
    new_value: PII_PLACEHOLDERS[PIIEntityType.CREDIT_CARD],
  },
  US_BANK_NUMBER: {
    type: 'replace',
    new_value: PII_PLACEHOLDERS[PIIEntityType.US_BANK_NUMBER],
  },
  MEDICAL_LICENSE: {
    type: 'replace',
    new_value: PII_PLACEHOLDERS[PIIEntityType.MEDICAL_LICENSE],
  },
  US_PASSPORT: {
    type: 'replace',
    new_value: PII_PLACEHOLDERS[PIIEntityType.US_PASSPORT],
  },
  US_DRIVER_LICENSE: {
    type: 'replace',
    new_value: PII_PLACEHOLDERS[PIIEntityType.US_DRIVER_LICENSE],
  },
  IP_ADDRESS: {
    type: 'replace',
    new_value: PII_PLACEHOLDERS[PIIEntityType.IP_ADDRESS],
  },
  URL: { type: 'replace', new_value: PII_PLACEHOLDERS[PIIEntityType.URL] },
  LOCATION: {
    type: 'replace',
    new_value: PII_PLACEHOLDERS[PIIEntityType.LOCATION],
  },
};

const GDPR_ANONYMIZERS: Record<string, PresidioOperator> = {
  DEFAULT: {
    type: 'replace',
    new_value: PII_PLACEHOLDERS[PIIEntityType.OTHER],
  },
  PERSON: {
    type: 'replace',
    new_value: PII_PLACEHOLDERS[PIIEntityType.PERSON],
  },
  EMAIL_ADDRESS: {
    type: 'replace',
    new_value: PII_PLACEHOLDERS[PIIEntityType.EMAIL_ADDRESS],
  },
  PHONE_NUMBER: {
    type: 'replace',
    new_value: PII_PLACEHOLDERS[PIIEntityType.PHONE_NUMBER],
  },
  LOCATION: {
    type: 'replace',
    new_value: PII_PLACEHOLDERS[PIIEntityType.LOCATION],
  },
  IP_ADDRESS: {
    type: 'replace',
    new_value: PII_PLACEHOLDERS[PIIEntityType.IP_ADDRESS],
  },
  URL: { type: 'replace', new_value: PII_PLACEHOLDERS[PIIEntityType.URL] },
  DATE_TIME: {
    type: 'replace',
    new_value: PII_PLACEHOLDERS[PIIEntityType.DATE_TIME],
  },
  IBAN_CODE: {
    type: 'replace',
    new_value: PII_PLACEHOLDERS[PIIEntityType.IBAN_CODE],
  },
  CREDIT_CARD: {
    type: 'replace',
    new_value: PII_PLACEHOLDERS[PIIEntityType.CREDIT_CARD],
  },
  NRP: { type: 'replace', new_value: PII_PLACEHOLDERS[PIIEntityType.NRP] },
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
      UK_NI_NUMBER: {
        type: 'replace',
        new_value: PII_PLACEHOLDERS[PIIEntityType.UK_NI_NUMBER],
      },
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
      CH_AHV_NUMBER: {
        type: 'replace',
        new_value: PII_PLACEHOLDERS[PIIEntityType.CH_AHV_NUMBER],
      },
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
