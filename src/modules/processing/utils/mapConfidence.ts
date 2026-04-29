import { Confidence } from '@common/constants';

export default function mapConfidence(score: number): Confidence {
  if (score >= 0.85) return Confidence.HIGH;
  if (score >= 0.5) return Confidence.MEDIUM;
  return Confidence.LOW;
}
