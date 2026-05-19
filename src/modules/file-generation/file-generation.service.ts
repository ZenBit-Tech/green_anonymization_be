import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Document, Packer, Paragraph } from 'docx';
import PDFDocument from 'pdfkit';

import { FileExtensions } from '@common/constants';
import ArchiveGeneratorService, {
  ArchiveEntry,
} from './archive-generator.service';

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
