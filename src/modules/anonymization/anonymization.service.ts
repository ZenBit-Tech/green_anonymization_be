import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Compliance } from '@common/constants';
import UserService from '@modules/user/user.service';
import { DataSource } from 'typeorm';
import Documents from '@common/db/entities/documents.entity';
import Entities from '@common/db/entities/entities.entity';
import User from '@common/db/entities/user.entity';
import AbstractAnonymizerService from './abstract-anonymizer.service';
import ANONYMIZER_SERVICES_TOKEN from './anonymizer-services.token';
import AnonymizerNotFoundError from './anonymizer-not-found.error';
import { AnonymizationResult } from './types/anonymizeResult';
import mapConfidence from './utils/mapConfidence';
import mapEntityType from './utils/mapEntityType';

@Injectable()
export default class AnonymizationService {
  private serviceMap: Map<Compliance, AbstractAnonymizerService>;

  constructor(
    @Inject(ANONYMIZER_SERVICES_TOKEN) services: AbstractAnonymizerService[],
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
  ) {
    this.serviceMap = new Map(services.map((s) => [s.complianceName, s]));
  }

  async anonymize(
    complianceName: Compliance,
    text: string,
    email: string,
  ): Promise<AnonymizationResult> {
    if (text === '') {
      return {
        originalText: '',
        anonymizedText: '',
        document: null as unknown as Documents,
        entities: [],
      };
    }

    const service = this.serviceMap.get(complianceName);

    if (!service) {
      throw new AnonymizerNotFoundError(complianceName);
    }

    const result = await service.anonymize(text);

    return this.dataSource.transaction(async (manager) => {
      const user: User | null = await this.userService.findByEmail(email);

      if (!user) {
        throw new BadRequestException('User not found');
      }

      const document = manager.create(Documents, {
        userId: user.uuid,
        chosenCompliance: complianceName,
        fileType: 'txt',
        fileName: `anonymized-${Date.now()}.txt`,
        filePath: 'cloud/path/placeholder',
        verifiedAt: new Date(),
      });

      const savedDocument = await manager.save(document);

      const entityEntities = result.entities.map((e) =>
        manager.create(Entities, {
          documentId: savedDocument.id,
          entityType: mapEntityType(e.entity_type),
          posStart: e.start,
          posEnd: e.end,
          score: e.score,
          confidence: mapConfidence(e.score),
        }),
      );

      const savedEntities = await manager.save(entityEntities);

      return {
        originalText: result.originalText,
        anonymizedText: result.anonymizedText,
        document: savedDocument,
        entities: savedEntities,
      };
    });
  }
}
