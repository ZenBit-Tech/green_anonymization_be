import { Injectable } from '@nestjs/common';
import DocumentsService from '../documents/documents.service';
import DocumentDetailDto from '../documents/dto/document-detail.dto';
import ManualGenerationService from './manualGeneration.service';

type GenerateSyntheticDataInput = {
  email: string;
  documentId: string;
  count: number;
};

@Injectable()
export default class SyntheticDataService {
  constructor(
    private readonly documentService: DocumentsService,
    private readonly manualGenerationService: ManualGenerationService,
  ) {}

  async generate(input: GenerateSyntheticDataInput) {
    const anonymizedDocument: DocumentDetailDto =
      await this.documentService.findByIdForEmail(
        input.documentId,
        input.email,
      );
    const syntheticDocuments = await Promise.all(
      Array.from({ length: input.count }, async (_, index) => {
        const manualResult =
          await this.manualGenerationService.generateManualData(
            anonymizedDocument.anonymizedText,
            anonymizedDocument.piiEntities,
          );
        return {
          id: `${input.documentId}-synthetic-${index + 1}`,
          syntheticText: manualResult.syntheticText,
          entities: manualResult.generatedEntities.map((e) => ({
            entity_type: e.type,
            value: e.value,
          })),
        };
      }),
    );

    return { syntheticDocuments };
  }
}
