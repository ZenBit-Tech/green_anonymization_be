import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { FileExtensions } from '@common/constants';
import FileGenerationService from './file-generation.service';
import ArchiveGeneratorService from './archive-generator.service';

jest.mock('archiver', () => {
  return {
    ZipArchive: jest.fn().mockImplementation(() => ({
      pipe: jest.fn(),
      append: jest.fn(),
      finalize: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
    })),
  };
});

describe('FileGenerationService', () => {
  let fileGenerationService: FileGenerationService;

  const mockArchiveBuffer = Buffer.from('zip-content');

  beforeEach(async () => {
    jest
      .spyOn(ArchiveGeneratorService, 'generateArchive')
      .mockResolvedValue(mockArchiveBuffer);

    const module: TestingModule = await Test.createTestingModule({
      providers: [FileGenerationService],
    }).compile();

    fileGenerationService = module.get<FileGenerationService>(
      FileGenerationService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateArchive', () => {
    it('should generate archive from TXT files', async () => {
      const result = await fileGenerationService.generateArchive({
        anonymizedTexts: ['Hello world'],
        extension: FileExtensions.TXT,
      });

      expect(result).toBe(mockArchiveBuffer);

      expect(ArchiveGeneratorService.generateArchive).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            filename: 'synthetic-1.txt',
            buffer: Buffer.from('Hello world'),
          }),
        ]),
      );
    });

    it('should generate multiple files', async () => {
      await fileGenerationService.generateArchive({
        anonymizedTexts: ['A', 'B', 'C'],
        extension: FileExtensions.TXT,
      });

      const callArg = (ArchiveGeneratorService.generateArchive as jest.Mock)
        .mock.calls[0][0];

      expect(callArg).toHaveLength(3);
      expect(callArg[0].filename).toBe('synthetic-1.txt');
      expect(callArg[1].filename).toBe('synthetic-2.txt');
      expect(callArg[2].filename).toBe('synthetic-3.txt');
    });

    it('should throw BadRequestException when no texts provided', async () => {
      await expect(
        fileGenerationService.generateArchive({
          anonymizedTexts: [],
          extension: FileExtensions.TXT,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for empty text item', async () => {
      await expect(
        fileGenerationService.generateArchive({
          anonymizedTexts: [''],
          extension: FileExtensions.TXT,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should use correct file extension for PDF', async () => {
      await fileGenerationService.generateArchive({
        anonymizedTexts: ['Hello'],
        extension: FileExtensions.PDF,
      });

      const callArg = (ArchiveGeneratorService.generateArchive as jest.Mock)
        .mock.calls[0][0];

      expect(callArg[0].filename).toBe('synthetic-1.pdf');
    });

    it('should use correct file extension for DOCX', async () => {
      await fileGenerationService.generateArchive({
        anonymizedTexts: ['Hello'],
        extension: FileExtensions.DOCX,
      });

      const callArg = (ArchiveGeneratorService.generateArchive as jest.Mock)
        .mock.calls[0][0];

      expect(callArg[0].filename).toBe('synthetic-1.docx');
    });
  });
});
