export const DEFAULT_PORT = 3000;
export const HELLO_MESSAGE = 'Hello World!';
export const NODE_ENV = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
};
export enum Compliance {
  GDPR = 'GDPR',
  HIPAA = 'HIPAA',
}

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

// TODO update when more precise list of entity types will be known
export enum PIIEntityType {
  PERSON = 'PERSON',
  PHONE_NUMBER = 'PHONE_NUMBER',
  EMAIL_ADDRESS = 'EMAIL_ADDRESS',
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
  UK_NINO = 'UK_NINO',
  OTHER = 'OTHER',
}
export enum Confidence {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}
