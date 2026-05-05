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

// The types of entities we got from out PM don't correspon exactly to Presidio entity types
// So I made EntityType enum use closest possible types
// When we add another non-presidio anonymizer later, this list might change
export enum EntityType {
  PERSON = 'PERSON', // Patient's name, surname, patronim etc
  PHONE_NUMBER = 'PHONE_NUMBER',
  EMAIL_ADDRESS = 'EMAIL_ADDRESS',
  LOCATION = 'LOCATION', // both residential address and geolocation. Presidio doesn't differentiate them, so we can't either (for now)
  IP_ADDRESS = 'IP_ADDRESS',
  MAC_ADDRESS = 'MAC_ADDRESS',
  MEDICAL_CLINICAL_EVENT = 'MEDICAL_CLINICAL_EVENT', // visits, admissions, hospitalizations, discharges
  MEDICAL_DISEASE_DISORDER = 'MEDICAL_DISEASE_DISORDER', // diagnosis
  MEDICAL_MEDICATION = 'MEDICAL_MEDICATION', // perscriptions, drugs
  MEDICAL_THERAPEUTIC_PROCEDURE = 'MEDICAL_THERAPEUTIC_PROCEDURE', // tests, analysis
  MEDICAL_BIOLOGICAL_ATTRIBUTE = 'MEDICAL_BIOLOGICAL_ATTRIBUTE', // biometrics
  MEDICAL_FAMILY_HISTORY = 'MEDICAL_FAMILY_HISTORY', // 'genetics',
  MEDICAL_HISTORY = 'MEDICAL_HISTORY', // medical records
  US_SSN = 'US_SSN', // social/insurance
  UK_NINO = 'UK_NINO', // social/insurance
  OTHER = 'OTHER', // social/insurance
}
export enum Confidence {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}
