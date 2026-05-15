import { Confidence, PIIEntityType } from '@common/constants';

export default class PiiEntityModel {
  id: string;

  documentId: string;

  entityType: PIIEntityType;

  start: number;

  end: number;

  score: number;

  confidence: Confidence;

  createdAt: Date;

  private constructor(
    id: string,
    documentId: string,
    entityType: PIIEntityType,
    start: number,
    end: number,
    score: number,
    confidence: Confidence,
    createdAt: Date,
  ) {
    this.id = id;
    this.documentId = documentId;
    this.entityType = entityType;
    this.start = start;
    this.end = end;
    this.score = score;
    this.confidence = confidence;
    this.createdAt = createdAt;
  }

  static create(data: {
    id: string;
    documentId: string;
    entityType: PIIEntityType;
    start: number;
    end: number;
    score: number;
    confidence: Confidence;
    createdAt: Date;
  }): PiiEntityModel {
    const {
      id,
      documentId,
      entityType,
      start,
      end,
      score,
      confidence,
      createdAt,
    } = data;

    if (start < 0 || end < 0 || start >= end) {
      throw new Error('Invalid text range: start must be >= 0 and < end');
    }
    if (score < 0 || score > 1) {
      throw new Error('Score must be between 0 and 1');
    }

    return new PiiEntityModel(
      id,
      documentId,
      entityType,
      start,
      end,
      score,
      confidence,
      createdAt,
    );
  }
}
