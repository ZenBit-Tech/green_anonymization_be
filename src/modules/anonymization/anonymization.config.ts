import { ConfigType, registerAs } from '@nestjs/config';

const anonymizationConfig = registerAs('anonymization', () => {
  const presidioAnalyzeUrl = process.env.PRESIDIO_ANALYZER_URL;
  const presidioAnonymizeUrl = process.env.PRESIDIO_ANONYMIZER_URL;

  if (!presidioAnalyzeUrl || !presidioAnonymizeUrl) {
    throw new Error('Missing required anonymization environment variables');
  }

  return {
    presidioAnalyzeUrl,
    presidioAnonymizeUrl,
  };
});

export default anonymizationConfig;
export type AnonymizationConfig = ConfigType<typeof anonymizationConfig>;
