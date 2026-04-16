export const DEFAULT_PORT = 3000;
export const HELLO_MESSAGE = 'Hello World!';
export const NODE_ENV = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
};
export const enum Compliance {
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
