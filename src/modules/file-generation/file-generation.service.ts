import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Document, Packer, Paragraph } from 'docx';
import PDFDocument from 'pdfkit';

import { FileExtensions } from '@common/constants';
import SyntheticDataService from '@modules/synthetic/synthetic.service';
import ArchiveGeneratorService, {
  ArchiveEntry,
} from './archive-generator.service';

@Injectable()
export default class FileGenerationService {
  constructor(
    private readonly syntheticDataService: SyntheticDataService,
    private readonly archiveGeneratorService: ArchiveGeneratorService,
  ) {}

  async generateArchive(input: {
    documentId: string;
    userEmail: string;
    count: number;
    extension: FileExtensions;
  }) {
    const { documentId, userEmail, count, extension } = input;
    console.log(documentId, userEmail, count, extension);
    const syntheticResult = await this.syntheticDataService.generate({
      email: userEmail,
      documentId,
      count,
    });
    console.log([syntheticResult.syntheticDocuments]);

    const files = await Promise.all(
      syntheticResult.syntheticDocuments.map((doc, index) =>
        this.generateFile(
          doc.syntheticText,
          extension,
          `synthetic-${index + 1}`,
        ),
      ),
    );

    console.log([files]);
    return this.archiveGeneratorService.generateArchive(files);
  }

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
        return this.generateTxt(text, baseName);

      case FileExtensions.PDF:
        return this.generatePdf(text, baseName);

      case FileExtensions.DOCX:
        return this.generateDocx(text, baseName);

      default:
        throw new BadRequestException('Unsupported file extension');
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private generateTxt(text: string, baseName: string): ArchiveEntry {
    return {
      buffer: Buffer.from(text, 'utf-8'),
      filename: `${baseName}.txt`,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  private async generatePdf(
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

  // eslint-disable-next-line class-methods-use-this
  private async generateDocx(
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
