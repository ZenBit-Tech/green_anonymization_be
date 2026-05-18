import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import Documents from '@common/db/entities/documents.entity';
import PIIEntities from '@common/db/entities/PIIEntities.entity';
import S3Service from '@common/services/s3.service';
import UserService from '@modules/user/user.service';
import DocumentDetailResponseDto from './dto/document-detail.dto';
import DocumentListResponseDto from './dto/document-list-response.dto';
import DocumentSummaryDto from './dto/document-summary.dto';
import DocumentTextResponseDto from './dto/document-text.dto';
import PaginationQueryDto from './dto/pagination-query.dto';

@Injectable()
export default class DocumentsService {
  constructor(
    @InjectRepository(Documents)
    private readonly repo: Repository<Documents>,
    @InjectRepository(PIIEntities)
    private readonly piiRepo: Repository<PIIEntities>,
    private readonly s3: S3Service,
    private readonly userService: UserService,
  ) {}

  async findAllByEmail(
    email: string,
    query: PaginationQueryDto,
  ): Promise<DocumentListResponseDto> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { page, limit } = query;

    try {
      const [docs, total] = await this.repo.findAndCount({
        where: { userId: user.uuid },
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

      return plainToInstance(
        DocumentListResponseDto,
        {
          items: docs.map((d) =>
            plainToInstance(DocumentSummaryDto, d, {
              excludeExtraneousValues: true,
            }),
          ),
          total,
          page,
          limit,
        },
        { excludeExtraneousValues: true },
      );
    } catch (err) {
      throw new InternalServerErrorException(
        `Failed to fetch user documents: ${(err as Error).message}`,
      );
    }
  }

  async findByIdForEmail(
    id: string,
    email: string,
  ): Promise<DocumentDetailResponseDto> {
    const doc = await this.findOwnedDocument(id, email);

    const [piiEntities, anonymizedText] = await Promise.all([
      this.piiRepo.find({ where: { documentId: id, isSelected: true } }),
      this.s3.getText(doc.filePath),
    ]);

    return plainToInstance(
      DocumentDetailResponseDto,
      { ...doc, piiEntities, anonymizedText },
      { excludeExtraneousValues: true },
    );
  }

  async updateTextForEmail(
    id: string,
    email: string,
    text: string,
  ): Promise<DocumentTextResponseDto> {
    const doc = await this.findOwnedDocument(id, email);

    await this.s3.uploadText(doc.filePath, text);

    doc.updatedAt = new Date();
    try {
      const updated = await this.repo.save(doc);
      return plainToInstance(
        DocumentTextResponseDto,
        { ...updated, anonymizedText: text },
        { excludeExtraneousValues: true },
      );
    } catch (err) {
      throw new InternalServerErrorException(
        `Failed to persist document update: ${(err as Error).message}`,
      );
    }
  }

  async updateEntitySelection(
    id: string,
    email: string,
    selectedEntityIds: string[],
  ): Promise<void> {
    await this.findOwnedDocument(id, email);

    try {
      await this.piiRepo.update(
        { documentId: id, isSelected: true },
        { isSelected: false },
      );

      if (selectedEntityIds.length > 0) {
        await this.piiRepo.update(
          { documentId: id, id: In(selectedEntityIds) },
          { isSelected: true },
        );
      }
    } catch (err) {
      throw new InternalServerErrorException(
        `Failed to update entity selection: ${(err as Error).message}`,
      );
    }
  }

  async uploadAnonymizedText(
    document: Documents,
    text: string,
    manager?: EntityManager,
  ): Promise<Documents> {
    const key = `documents/${document.userId}/${document.id}.txt`;
    await this.s3.uploadText(key, text);

    const repo = manager ? manager.getRepository(Documents) : this.repo;
    try {
      return await repo.save({ ...document, filePath: key });
    } catch (err) {
      throw new InternalServerErrorException(
        `Failed to persist document filePath: ${(err as Error).message}`,
      );
    }
  }

  private async findOwnedDocument(
    id: string,
    email: string,
    withRelations = false,
  ): Promise<Documents> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let doc: Documents | null;
    try {
      doc = await this.repo.findOne({
        where: { id },
        ...(withRelations ? { relations: { piiEntities: true } } : {}),
      });
    } catch (err) {
      throw new InternalServerErrorException(
        `Failed to fetch document: ${(err as Error).message}`,
      );
    }

    if (!doc) {
      throw new NotFoundException('Document not found');
    }
    if (doc.userId !== user.uuid) {
      throw new ForbiddenException('Document does not belong to current user');
    }
    return doc;
  }
}
