import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import ArchiveGeneratorService from './archive-generator.service';
import DocumentsService from '../documents/documents.service';
import PiiEntityMapper from '../../common/mappers/pii-entity.mapper';
import DocumentDetailDto from '../documents/dto/document-detail.dto';

@Injectable()
export default class FileGenerationService {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly archiveGeneratorService: ArchiveGeneratorService,
  ) {}

  async generateArchive(input: {
    documentId: string;
    userEmail: string;
  }): Promise<Buffer> {
    const { documentId, userEmail } = input;

    let documentDetailDto: DocumentDetailDto;
    try {
      documentDetailDto = await this.documentsService.findByIdForEmail(
        documentId,
        userEmail,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Document or user not found');
      }

      if (
        error instanceof ForbiddenException ||
        error instanceof UnauthorizedException
      ) {
        throw new UnauthorizedException(
          'Unauthorized to access requested document',
        );
      }

      throw new Error('Document not found or access denied');
    }

    const { anonymizedText, piiEntities } = documentDetailDto;

    const piiEntityModels = piiEntities.map((piiEntityDto) =>
      PiiEntityMapper.dtoToDomain(piiEntityDto),
    );

    let archive: Buffer;
    try {
      archive = this.archiveGeneratorService.generateArchive({
        anonymizedText,
        piiEntityModels,
      });
    } catch (error) {
      throw new Error('Failed to generate archive');
    }

    return archive;
  }
}
