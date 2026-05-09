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
import PIIEntities from '@/common/db/entities/PIIEntities.entity';
import User from '@/common/db/entities/user.entity';
import { AnonymizationResult } from '@modules/anonymization/anonymization.types';
import { ProcessingResult } from './types/ProcessingResult';
import mapConfidence from './utils/mapConfidence';
import mapPIIEntityType from './utils/mapPIIEntityType';

@Injectable()
export default class ProcessingService {
  constructor(
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
    private readonly anonymizationService: AnonymizationService,
  ) {}

  async process(
    complianceName: Compliance,
    frameworkCode: string,
    text: string,
    email: string,
    originalFileName?: string,
  ): Promise<ProcessingResult> {
    if (text === '') {
      return {
        originalText: '',
        anonymizedText: '',
        document: null as unknown as Documents,
        piiEntities: [],
      };
    }

    try {
      return await this.dataSource.transaction(async (manager) => {
        const anonymizationResult: AnonymizationResult =
          await this.anonymizationService.anonymize(complianceName, text);

        const user: User | null = await this.userService.findByEmail(email);

        if (!user) {
          throw new BadRequestException('User not found');
        }

        const document = manager.create(Documents, {
          userId: user.uuid,
          chosenCompliance: complianceName,
          frameworkCode,
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
        const piiEntities = anonymizationResult?.metadata?.entities.map((e) =>
          manager.create(PIIEntities, {
            documentId: savedDocument.id,
            entityType: mapPIIEntityType(e.entity_type),
            start: e.start,
            end: e.end,
            score: e.score ?? 0.0,
            confidence: mapConfidence(e.score),
          }),
        );

        const savedPIIEntities = await manager.save(piiEntities);

        return {
          originalText: anonymizationResult.originalText,
          anonymizedText: anonymizationResult.anonymizedText,
          document: savedDocument,
          piiEntities: savedPIIEntities,
        };
      });
    } catch (err) {
      throw new BadRequestException(
        `Failed to persist anonymization result, error: ${err}`,
      );
    }
  }
}
