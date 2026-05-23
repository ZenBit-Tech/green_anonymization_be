import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { FileExtensions } from '@common/constants';
import ExcelJS from 'exceljs';
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

jest.mock('exceljs', () => {
  const actual = jest.requireActual('exceljs');

  return {
    ...actual,
    Workbook: jest.fn().mockImplementation(() => {
      const worksheet = {
        addRow: jest.fn(),
        getRow: jest.fn(() => ({ font: {} })),
        getColumn: jest.fn(() => ({
          eachCell: jest.fn((opts, cb) => {
            cb({ value: 'test' });
            cb({ value: 'longertext' });
          }),
        })),
        columnCount: 3,
        views: [],
        autoFilter: null,
      };

      return {
        addWorksheet: jest.fn(() => worksheet),
        xlsx: {
          writeBuffer: jest.fn().mockResolvedValue(Buffer.from('excel')),
        },
      };
    }),
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
  describe('generateTable', () => {
    it('should throw BadRequestException when input is empty', async () => {
      await expect(fileGenerationService.generateTable([])).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should generate Excel table with correct headers', async () => {
      const input = [
        [
          { entity_type: 'PERSON', value: 'John' },
          { entity_type: 'LOCATION', value: 'London' },
        ],
      ];

      const result = await fileGenerationService.generateTable(input);

      expect(result).toBeInstanceOf(Buffer);
    });

    it('should create correct number of rows', async () => {
      const input = [
        [
          { entity_type: 'PERSON', value: 'A' },
          { entity_type: 'LOCATION', value: 'B' },
        ],
        [
          { entity_type: 'PERSON', value: 'C' },
          { entity_type: 'LOCATION', value: 'D' },
        ],
      ];

      await fileGenerationService.generateTable(input);

      const workbookMock = (ExcelJS.Workbook as jest.Mock).mock.results[0]
        .value;

      const worksheet = workbookMock.addWorksheet.mock.results[0].value;

      expect(worksheet.addRow).toHaveBeenCalledWith([
        'ID',
        'PERSON',
        'LOCATION',
      ]);
      expect(worksheet.addRow).toHaveBeenCalledWith([1, 'A', 'B']);
      expect(worksheet.addRow).toHaveBeenCalledWith([2, 'C', 'D']);
    });

    it('should set header row bold', async () => {
      const input = [
        [
          { entity_type: 'PERSON', value: 'A' },
          { entity_type: 'LOCATION', value: 'B' },
        ],
      ];

      await fileGenerationService.generateTable(input);

      const workbookMock = (ExcelJS.Workbook as jest.Mock).mock.results[0]
        .value;

      const worksheet = workbookMock.addWorksheet.mock.results[0].value;

      expect(worksheet.getRow).toHaveBeenCalledWith(1);
    });

    it('should set frozen header and autofilter', async () => {
      const input = [
        [
          { entity_type: 'PERSON', value: 'A' },
          { entity_type: 'LOCATION', value: 'B' },
        ],
      ];

      await fileGenerationService.generateTable(input);

      const workbookMock = (ExcelJS.Workbook as jest.Mock).mock.results[0]
        .value;

      const worksheet = workbookMock.addWorksheet.mock.results[0].value;

      expect(worksheet.views).toEqual([
        {
          state: 'frozen',
          ySplit: 1,
        },
      ]);

      expect(worksheet.autoFilter).toEqual({
        from: 'A1',
        to: {
          row: 1,
          column: 3,
        },
      });
    });

    it('should return Buffer from workbook', async () => {
      const input = [
        [
          { entity_type: 'PERSON', value: 'A' },
          { entity_type: 'LOCATION', value: 'B' },
        ],
      ];

      const result = await fileGenerationService.generateTable(input);

      expect(result).toBeInstanceOf(Buffer);
    });
  });
});
