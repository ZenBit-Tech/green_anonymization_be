export const DEFAULT_PORT = 3000;
export const HELLO_MESSAGE = 'Hello World!';
export const NODE_ENV = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
};

export const MAGIC_LINK_EXPIRATION = '60m';
export const ACCESS_TOKEN_EXPIRATION = '15m';
export const REFRESH_TOKEN_EXPIRATION = '7d';

export enum JwtTokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
  MAGIC = 'magic',
}
export const PRESIDIO_ANONYMIZER_ANONYMIZE_ENDPOINT = '/anonymize';
export const PRESIDIO_ANONYMIZER_ANALYZE_ENDPOINT = '/analyze';

export const YEAR_MONTH_FORMAT = '%Y-%m';

// TODO update when more precise list of entity types will be known
export enum PIIEntityType {
  PERSON = 'PERSON',
  PHONE_NUMBER = 'PHONE_NUMBER',
  EMAIL_ADDRESS = 'EMAIL_ADDRESS',
  DATE_TIME = 'DATE_TIME',
  DATE = 'DATE',
  LOCATION = 'LOCATION',
  IP_ADDRESS = 'IP_ADDRESS',
  MAC_ADDRESS = 'MAC_ADDRESS',
  MEDICAL_CLINICAL_EVENT = 'MEDICAL_CLINICAL_EVENT',
  MEDICAL_DISEASE_DISORDER = 'MEDICAL_DISEASE_DISORDER',
  MEDICAL_MEDICATION = 'MEDICAL_MEDICATION',
  MEDICAL_THERAPEUTIC_PROCEDURE = 'MEDICAL_THERAPEUTIC_PROCEDURE',
  MEDICAL_BIOLOGICAL_ATTRIBUTE = 'MEDICAL_BIOLOGICAL_ATTRIBUTE',
  MEDICAL_FAMILY_HISTORY = 'MEDICAL_FAMILY_HISTORY',
  MEDICAL_HISTORY = 'MEDICAL_HISTORY',
  US_SSN = 'US_SSN',
  UK_NI_NUMBER = 'UK_NI_NUMBER',
  CH_AHV_NUMBER = 'CH_AHV_NUMBER',
  CREDIT_CARD = 'CREDIT_CARD',
  US_BANK_NUMBER = 'US_BANK_NUMBER',
  IBAN_CODE = 'IBAN_CODE',
  NRP = 'NRP',
  URL = 'URL',
  MEDICAL_LICENSE = 'MEDICAL_LICENSE',
  US_PASSPORT = 'US_PASSPORT',
  US_DRIVER_LICENSE = 'US_DRIVER_LICENSE',
  OTHER = 'OTHER',
}

export enum Confidence {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export interface ComplianceFrameworkConfig {
  code: string;
  name: string;
  description?: string;
  entityTypesCount?: number;
  isActive: boolean;
}

export const COMPLIANCE_FRAMEWORKS = {
  HIPAA_US: {
    code: 'HIPAA_US',
    name: 'HIPAA',
    description: 'Health Insurance Portability and Accountability Act (US)',
    entityTypesCount: 18,
    isActive: true,
  } as ComplianceFrameworkConfig,
  GDPR_EU: {
    code: 'GDPR_EU',
    name: 'EU GDPR',
    description: 'European Union General Data Protection Regulation',
    entityTypesCount: 11,
    isActive: true,
  } as ComplianceFrameworkConfig,
  GDPR_UK: {
    code: 'GDPR_UK',
    name: 'UK GDPR',
    description: 'United Kingdom General Data Protection Regulation',
    entityTypesCount: 11,
    isActive: true,
  } as ComplianceFrameworkConfig,
  FADP_CH: {
    code: 'FADP_CH',
    name: 'Swiss FADP',
    description: 'Swiss Federal Act on Data Protection',
    entityTypesCount: 11,
    isActive: true,
  } as ComplianceFrameworkConfig,
};

export type ComplianceFramework =
  (typeof COMPLIANCE_FRAMEWORKS)[keyof typeof COMPLIANCE_FRAMEWORKS];

export const DATE_FORMAT = 'yyyy-MM-dd';

export enum FileExtensions {
  TXT = 'txt',
  PDF = 'pdf',
  DOCX = 'docx',
}
