import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import AnonymizationService from '@modules/anonymization/anonymization.service';
import UserService from '@modules/user/user.service';
import { DataSource } from 'typeorm';
import { Compliance } from '@/common/constants';
import Documents from '@/common/db/entities/documents.entity';
import Entities from '@/common/db/entities/entities.entity';
import User from '@/common/db/entities/user.entity';
import { AnonymizationResult } from '@modules/anonymization/anonymization.types';
import { ProcessingResult } from './types/anonymizeResult';
import mapConfidence from './utils/mapConfidence';
import mapEntityType from './utils/mapEntityType';

@Injectable()
export default class ProcessingService {
  constructor(
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
    private readonly anonymizationService: AnonymizationService,
  ) {}

  async process(
    complianceName: Compliance,
    text: string,
    email: string,
    originalFileName?: string,
  ): Promise<ProcessingResult> {
    if (text === '') {
      return {
        originalText: '',
        anonymizedText: '',
        document: null as unknown as Documents,
        entities: [],
      };
    }

    const anonymizationResult: AnonymizationResult =
      await this.anonymizationService.anonymize(complianceName, text);

    try {
      return await this.dataSource.transaction(async (manager) => {
        const user: User | null = await this.userService.findByEmail(email);

        if (!user) {
          throw new BadRequestException('User not found');
        }

        const document = manager.create(Documents, {
          userId: user.uuid,
          chosenCompliance: complianceName,
          fileType: 'Medical Record',
          fileName: originalFileName
            ? `${originalFileName}-${complianceName}-${Date.now()}`
            : `${complianceName}-${Date.now()}.txt`,
          filePath: 'cloud/path/placeholder',
          verifiedAt: new Date(),
        });

        const savedDocument = await manager.save(document);
        if (!anonymizationResult.metadata) {
          throw new InternalServerErrorException(
            'No metadata found in anonymization result',
          );
        }
        const entities = anonymizationResult?.metadata?.entities.map((e) =>
          manager.create(Entities, {
            documentId: savedDocument.id,
            entityType: mapEntityType(e.entity_type),
            start: e.start,
            end: e.end,
            score: e.score ?? 0.0,
            confidence: mapConfidence(e.score),
          }),
        );

        const savedEntities = await manager.save(entities);

        return {
          originalText: anonymizationResult.originalText,
          anonymizedText: anonymizationResult.anonymizedText,
          document: savedDocument,
          entities: savedEntities,
        };
      });
    } catch (err) {
      throw new BadRequestException(
        `Failed to persist anonymization result, error: ${err}`,
      );
    }
  }
}
