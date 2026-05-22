import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Document, Packer, Paragraph } from 'docx';
import PDFDocument from 'pdfkit';

import { FileExtensions } from '@common/constants';
import ExcelJS from 'exceljs';
import ArchiveGeneratorService, {
  ArchiveEntry,
} from './archive-generator.service';
import SyntheticEntityDto from '../synthetic/dto/synthetic-entity.dto';

@Injectable()
export default class FileGenerationService {
  async generateArchive(input: {
    anonymizedTexts: string[];
    extension: FileExtensions;
  }): Promise<Buffer> {
    const { anonymizedTexts, extension } = input;

    if (!anonymizedTexts?.length) {
      throw new BadRequestException('No texts provided');
    }

    const files = await Promise.all(
      anonymizedTexts.map((text, index) =>
        this.generateFile(text, extension, `synthetic-${index + 1}`),
      ),
    );

    return ArchiveGeneratorService.generateArchive(files);
  }

  // eslint-disable-next-line class-methods-use-this
  async generateTable(input: SyntheticEntityDto[][]): Promise<Buffer> {
    if (!input?.length) {
      throw new BadRequestException('No synthetic entities provided');
    }

    try {
      const workbook = new ExcelJS.Workbook();

      const worksheet = workbook.addWorksheet('Synthetic Data');

      const headers = ['ID', ...input[0].map((entity) => entity.entity_type)];

      worksheet.addRow(headers);

      input.forEach((entities, index) => {
        const row = [index + 1, ...entities.map((entity) => entity.value)];

        worksheet.addRow(row);
      });

      worksheet.getRow(1).font = {
        bold: true,
      };

      worksheet.views = [
        {
          state: 'frozen',
          ySplit: 1,
        },
      ];

      worksheet.autoFilter = {
        from: 'A1',
        to: {
          row: 1,
          column: headers.length,
        },
      };

      for (
        let columnIndex = 1;
        columnIndex <= worksheet.columnCount;
        columnIndex += 1
      ) {
        const column = worksheet.getColumn(columnIndex);

        let maxLength = 10;

        column.eachCell({ includeEmpty: true }, (cell) => {
          const value = String(cell.value ?? '');

          maxLength = Math.max(maxLength, value.length);
        });

        column.width = maxLength + 2;
      }

      const buffer = await workbook.xlsx.writeBuffer();

      return Buffer.from(buffer);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to generate table: ${(error as Error).message}`,
      );
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private async generateFile(
    text: string,
    extension: FileExtensions,
    baseName: string,
  ): Promise<ArchiveEntry> {
    if (!text) {
      throw new BadRequestException('No text provided for file generation');
    }

    switch (extension) {
      case FileExtensions.TXT:
        return FileGenerationService.generateTxt(text, baseName);

      case FileExtensions.PDF:
        return FileGenerationService.generatePdf(text, baseName);

      case FileExtensions.DOCX:
        return FileGenerationService.generateDocx(text, baseName);

      default:
        throw new BadRequestException('Unsupported file extension');
    }
  }

  private static generateTxt(text: string, baseName: string): ArchiveEntry {
    return {
      buffer: Buffer.from(text, 'utf-8'),
      filename: `${baseName}.txt`,
    };
  }

  private static async generatePdf(
    text: string,
    baseName: string,
  ): Promise<ArchiveEntry> {
    return new Promise<ArchiveEntry>((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });

      doc.on('end', () => {
        resolve({
          buffer: Buffer.concat(chunks),
          filename: `${baseName}.pdf`,
        });
      });

      doc.on('error', reject);

      doc.text(text);
      doc.end();
    });
  }

  private static async generateDocx(
    text: string,
    baseName: string,
  ): Promise<ArchiveEntry> {
    try {
      const doc = new Document({
        sections: [
          {
            children: [new Paragraph({ text })],
          },
        ],
      });

      const buffer = await Packer.toBuffer(doc);

      return {
        buffer,
        filename: `${baseName}.docx`,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to generate DOCX file: ${(error as Error).message}`,
      );
    }
  }
}
