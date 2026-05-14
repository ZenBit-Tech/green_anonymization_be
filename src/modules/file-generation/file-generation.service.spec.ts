import { Test, TestingModule } from '@nestjs/testing';
import {
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import FileGenerationService from './file-generation.service';
import ArchiveGeneratorService from './archive-generator.service';
import DocumentsService from '../documents/documents.service';
import DocumentDetailDto from '../documents/dto/document-detail.dto';
import PIIEntityDto from '../processing/dto/piiEntity.dto';
import { PIIEntityType, Confidence } from '../../common/constants';

describe('FileGenerationService', () => {
  let fileGenerationService: FileGenerationService;
  let documentsService: jest.Mocked<DocumentsService>;
  let archiveGeneratorService: jest.Mocked<ArchiveGeneratorService>;

  const mockDocumentId = 'doc-123';
  const mockUserEmail = 'user@example.com';
  const mockAnonymizedText = 'This is anonymized text';
  const mockArchiveBuffer = Buffer.from([
    0x50, 0x4b, 0x03, 0x04, 0x0a, 0x00, 0x00, 0x00,
  ]);

  const createMockPiiEntity = (
    overrides?: Partial<PIIEntityDto>,
  ): PIIEntityDto => ({
    id: 'pii-1',
    documentId: mockDocumentId,
    entityType: PIIEntityType.PERSON,
    start: 0,
    end: 4,
    score: 0.95,
    confidence: Confidence.HIGH,
    createdAt: new Date(),
    ...overrides,
  });

  const createMockDocumentDetail = (
    overrides?: Partial<DocumentDetailDto>,
  ): DocumentDetailDto =>
    ({
      id: mockDocumentId,
      fileName: 'test-document.txt',
      fileType: 'text/plain',
      chosenCompliance: 'GDPR',
      verifiedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      anonymizedText: mockAnonymizedText,
      piiEntities: [],
      ...overrides,
    }) as DocumentDetailDto;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileGenerationService,
        {
          provide: DocumentsService,
          useValue: {
            findByIdForEmail: jest.fn(),
          },
        },
        {
          provide: ArchiveGeneratorService,
          useValue: {
            generateArchive: jest.fn(),
          },
        },
      ],
    }).compile();

    fileGenerationService = module.get<FileGenerationService>(
      FileGenerationService,
    );
    documentsService = module.get(
      DocumentsService,
    ) as jest.Mocked<DocumentsService>;
    archiveGeneratorService = module.get(
      ArchiveGeneratorService,
    ) as jest.Mocked<ArchiveGeneratorService>;
  });

  describe('generateArchive', () => {
    describe('successful archive generation', () => {
      it('should return a valid Buffer when document exists and user has access', async () => {
        const mockDocumentDetail = createMockDocumentDetail({
          piiEntities: [createMockPiiEntity()],
        });

        documentsService.findByIdForEmail.mockResolvedValue(mockDocumentDetail);
        archiveGeneratorService.generateArchive.mockReturnValue(
          mockArchiveBuffer,
        );

        const result = await fileGenerationService.generateArchive({
          documentId: mockDocumentId,
          userEmail: mockUserEmail,
        });

        expect(result).toEqual(mockArchiveBuffer);
        expect(result).toBeInstanceOf(Buffer);
      });

      it('should return a valid Buffer with multiple PII entities', async () => {
        const mockPiiEntity1 = createMockPiiEntity();
        const mockPiiEntity2 = createMockPiiEntity({
          id: 'pii-2',
          entityType: PIIEntityType.EMAIL_ADDRESS,
          start: 5,
          end: 20,
          score: 0.99,
        });
        const mockDocumentDetail = createMockDocumentDetail({
          piiEntities: [mockPiiEntity1, mockPiiEntity2],
        });

        documentsService.findByIdForEmail.mockResolvedValue(mockDocumentDetail);
        archiveGeneratorService.generateArchive.mockReturnValue(
          mockArchiveBuffer,
        );

        const result = await fileGenerationService.generateArchive({
          documentId: mockDocumentId,
          userEmail: mockUserEmail,
        });

        expect(result).toBeInstanceOf(Buffer);
        expect(result.length).toBeGreaterThan(0);
      });

      it('should return a valid Buffer with large number of PII entities', async () => {
        const largePiiArray = Array.from({ length: 1000 }, (_, i) =>
          createMockPiiEntity({ id: `pii-${i}` }),
        );
        const mockDocumentDetail = createMockDocumentDetail({
          piiEntities: largePiiArray,
        });

        documentsService.findByIdForEmail.mockResolvedValue(mockDocumentDetail);
        archiveGeneratorService.generateArchive.mockReturnValue(
          mockArchiveBuffer,
        );

        const result = await fileGenerationService.generateArchive({
          documentId: mockDocumentId,
          userEmail: mockUserEmail,
        });

        expect(result).toBeInstanceOf(Buffer);
        expect(result.length).toBeGreaterThan(0);
      });

      it('should return a valid Buffer when anonymizedText is undefined', async () => {
        const mockDocumentDetail = createMockDocumentDetail({
          anonymizedText: undefined,
        });

        documentsService.findByIdForEmail.mockResolvedValue(mockDocumentDetail);
        archiveGeneratorService.generateArchive.mockReturnValue(
          mockArchiveBuffer,
        );

        const result = await fileGenerationService.generateArchive({
          documentId: mockDocumentId,
          userEmail: mockUserEmail,
        });

        expect(result).toBeInstanceOf(Buffer);
      });

      it('should return a valid Buffer when anonymizedText is empty', async () => {
        const mockDocumentDetail = createMockDocumentDetail({
          anonymizedText: '',
        });

        documentsService.findByIdForEmail.mockResolvedValue(mockDocumentDetail);
        archiveGeneratorService.generateArchive.mockReturnValue(
          mockArchiveBuffer,
        );

        const result = await fileGenerationService.generateArchive({
          documentId: mockDocumentId,
          userEmail: mockUserEmail,
        });

        expect(result).toBeInstanceOf(Buffer);
      });
    });

    describe('error handling - document not found', () => {
      it('should throw NotFoundException with specific message when document does not exist', async () => {
        documentsService.findByIdForEmail.mockRejectedValue(
          new NotFoundException('Original not found error'),
        );

        await expect(
          fileGenerationService.generateArchive({
            documentId: mockDocumentId,
            userEmail: mockUserEmail,
          }),
        ).rejects.toThrow(new NotFoundException('Document or user not found'));
      });
    });

    describe('error handling - unauthorized access', () => {
      it('should throw UnauthorizedException when user lacks access due to forbidden', async () => {
        documentsService.findByIdForEmail.mockRejectedValue(
          new ForbiddenException('Access denied'),
        );

        await expect(
          fileGenerationService.generateArchive({
            documentId: mockDocumentId,
            userEmail: mockUserEmail,
          }),
        ).rejects.toThrow(
          new UnauthorizedException(
            'Unauthorized to access requested document',
          ),
        );
      });

      it('should throw UnauthorizedException when user lacks access due to missing authentication', async () => {
        documentsService.findByIdForEmail.mockRejectedValue(
          new UnauthorizedException('Not authenticated'),
        );

        await expect(
          fileGenerationService.generateArchive({
            documentId: mockDocumentId,
            userEmail: mockUserEmail,
          }),
        ).rejects.toThrow(
          new UnauthorizedException(
            'Unauthorized to access requested document',
          ),
        );
      });
    });

    describe('error handling - archive generation failure', () => {
      it('should throw Error when archive generation fails', async () => {
        const mockDocumentDetail = createMockDocumentDetail({
          piiEntities: [createMockPiiEntity()],
        });

        documentsService.findByIdForEmail.mockResolvedValue(mockDocumentDetail);
        archiveGeneratorService.generateArchive.mockImplementation(() => {
          throw new Error('Archive generation failed');
        });

        await expect(
          fileGenerationService.generateArchive({
            documentId: mockDocumentId,
            userEmail: mockUserEmail,
          }),
        ).rejects.toThrow('Failed to generate archive');
      });
    });

    describe('error handling - unexpected errors', () => {
      it('should throw Error for unexpected exceptions from dependencies', async () => {
        documentsService.findByIdForEmail.mockRejectedValue(
          new Error('Connection failed'),
        );

        await expect(
          fileGenerationService.generateArchive({
            documentId: mockDocumentId,
            userEmail: mockUserEmail,
          }),
        ).rejects.toThrow('Document not found or access denied');
      });
    });
  });
});
