import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ZipArchive } from 'archiver';
import { PassThrough } from 'stream';

export type ArchiveEntry = {
  filename: string;
  buffer: Buffer;
};

@Injectable()
export default class ArchiveGeneratorService {
  static async generateArchive(entries: ArchiveEntry[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const archive = new ZipArchive({
        zlib: { level: 9 },
      });

      const output = new PassThrough();
      const chunks: Buffer[] = [];

      output.on('data', (chunk: Buffer) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });

      output.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      output.on('error', (error) => {
        reject(
          new InternalServerErrorException(
            `Output stream error: ${error.message}`,
          ),
        );
      });

      archive.on('warning', (error: NodeJS.ErrnoException) => {
        // Ignore missing-file warnings if desired
        if (error.code !== 'ENOENT') {
          reject(
            new InternalServerErrorException(
              `Archive warning: ${error.message}`,
            ),
          );
        }
      });

      archive.on('error', (error: Error) => {
        reject(
          new InternalServerErrorException(
            `Archive generation failed: ${error.message}`,
          ),
        );
      });

      archive.pipe(output);

      entries.forEach((entry) => {
        archive.append(entry.buffer, {
          name: entry.filename,
        });
      });

      archive.finalize().catch((error: Error) => {
        reject(
          new InternalServerErrorException(
            `Archive finalization failed: ${error.message}`,
          ),
        );
      });
    });
  }
}
