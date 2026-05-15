import { Injectable, InternalServerErrorException } from '@nestjs/common';
import archiver from 'archiver';
import { Writable } from 'stream';

export type ArchiveEntry = {
  filename: string;
  buffer: Buffer;
};

@Injectable()
export default class ArchiveGeneratorService {
  // eslint-disable-next-line class-methods-use-this
  async generateArchive(entries: ArchiveEntry[]) {
    return new Promise((resolve, reject) => {
      const archive = archiver('zip', {
        zlib: { level: 9 },
      });

      const chunks: Buffer[] = [];

      const writable = new Writable({
        write(chunk, _encoding, callback) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          callback();
        },
      });

      writable.on('finish', () => {
        resolve(Buffer.concat(chunks));
      });

      writable.on('error', reject);

      archive.on('error', reject);

      archive.on('end', () => {});

      archive.pipe(writable);

      try {
        // eslint-disable-next-line no-restricted-syntax
        for (const entry of entries) {
          console.log(entry);
          archive.append(entry.buffer, { name: entry.filename });
        }

        archive.finalize();
      } catch (err) {
        reject(err);
      }
    }).catch((err) => {
      throw new InternalServerErrorException(
        `Archive generation failed: ${err?.message ?? err}`,
      );
    });
  }
}
