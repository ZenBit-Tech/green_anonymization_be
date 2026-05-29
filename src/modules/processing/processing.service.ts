import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import AnonymizationService from '@modules/anonymization/anonymization.service';
import UserService from '@modules/user/user.service';
import DocumentsService from '@modules/documents/documents.service';
import { DataSource } from 'typeorm';
import { ComplianceFrameworkConfig } from '@/common/constants';
import Documents from '@/common/db/entities/documents.entity';
import PIIEntities from '@/common/db/entities/PIIEntities.entity';
import User from '@/common/db/entities/user.entity';
import { AnonymizationResult } from '@modules/anonymization/anonymization.types';
import formatDate from '@common/utils/formatDate';
import { ProcessingResult } from './types/ProcessingResult';
import mapConfidence from './utils/mapConfidence';
import mapPIIEntityType from './utils/mapPIIEntityType';

@Injectable()
export default class ProcessingService {
  constructor(
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
    private readonly anonymizationService: AnonymizationService,
    private readonly documentsService: DocumentsService,
  ) {}

  async process(
    compliance: ComplianceFrameworkConfig,
    text: string,
    email: string,
    originalFileName?: string,
    documentId?: string,
  ): Promise<ProcessingResult> {
    if (text === '') {
      return {
        originalText: '',
        anonymizedText: '',
        document: null as unknown as Documents,
        piiEntities: [],
      };
    }

    const user: User | null = await this.userService.findByEmail(email);
    if (!user) throw new BadRequestException('User not found');

    const anonymizationResult: AnonymizationResult =
      await this.anonymizationService.anonymize(compliance, text);

    await this.userService.setDefaultFramework(user.email, compliance.code);

    try {
      return await this.dataSource.transaction(async (manager) => {
        if (!anonymizationResult.metadata) {
          throw new InternalServerErrorException(
            'No metadata found in anonymization result',
          );
        }

        const { entities, items = [] } = anonymizationResult.metadata;
        const operatorByEntity = new Map(
          items.map((item) => [item.entity_type, item.operator]),
        );

        let savedDocument: Documents;

        if (documentId) {
          const existing = await manager.findOne(Documents, {
            where: { id: documentId },
          });
          if (!existing) throw new NotFoundException('Document not found');
          if (existing.userId !== user.uuid)
            throw new ForbiddenException('Document does not belong to user');

          await manager.delete(PIIEntities, { documentId });

          existing.chosenCompliance = compliance.code;
          existing.lastReanalysedAt = new Date();
          savedDocument = await manager.save(existing);
        } else {
          const document = manager.create(Documents, {
            userId: user.uuid,
            chosenCompliance: compliance.code,
            fileType: 'Medical Record',
            fileName: originalFileName
              ? `${compliance.name}-${formatDate(new Date())}-${originalFileName}`
              : `${compliance.name}-${formatDate(new Date())}.txt`,
            filePath: 'cloud/path/placeholder',
            verifiedAt: new Date(),
          });
          savedDocument = await manager.save(document);
        }

        const piiEntities = entities.map((e) =>
          manager.create(PIIEntities, {
            documentId: savedDocument.id,
            entityType: mapPIIEntityType(e.entity_type),
            start: e.start,
            end: e.end,
            score: e.score ?? 0.0,
            confidence: mapConfidence(e.score),
            deIdMethod: operatorByEntity.get(e.entity_type),
          }),
        );
        const savedPIIEntities = await manager.save(piiEntities);

        const documentWithText =
          await this.documentsService.uploadAnonymizedText(
            savedDocument,
            anonymizationResult.anonymizedText,
            manager,
          );

        return {
          originalText: anonymizationResult.originalText,
          anonymizedText: anonymizationResult.anonymizedText,
          document: documentWithText,
          piiEntities: savedPIIEntities,
        };
      });
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      if (err instanceof InternalServerErrorException) throw err;
      if (err instanceof NotFoundException) throw err;
      if (err instanceof ForbiddenException) throw err;
      throw new BadRequestException('Failed to persist anonymization result');
    }
  }
}
