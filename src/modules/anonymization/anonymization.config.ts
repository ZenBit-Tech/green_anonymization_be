import { ConfigType, registerAs } from '@nestjs/config';

const anonymizationConfig = registerAs('anonymization', () => {
  const presidioAnalyzeUrl = process.env.PRESIDIO_ANALYZER_URL;
  const presidioAnonymizeUrl = process.env.PRESIDIO_ANONYMIZER_URL;
  const presidioAnalyzerPort = process.env.PRESIDIO_ANALYZER_PORT;
  const presidioAnonymizerPort = process.env.PRESIDIO_ANONYMIZER_PORT;
  const ollamaPort = process.env.OLLAMA_PORT;

  if (
    !presidioAnalyzeUrl ||
    !presidioAnonymizeUrl ||
    !presidioAnalyzerPort ||
    !presidioAnonymizerPort ||
    !ollamaPort
  ) {
    throw new Error('Missing required anonymization environment variables');
  }

  return {
    presidioAnalyzeUrl,
    presidioAnonymizeUrl,
    presidioAnalyzerPort,
    presidioAnonymizerPort,
    ollamaPort,
  };
});

export default anonymizationConfig;
export type AnonymizationConfig = ConfigType<typeof anonymizationConfig>;
