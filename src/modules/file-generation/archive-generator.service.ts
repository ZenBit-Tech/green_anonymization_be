import { Injectable } from '@nestjs/common';
import PiiEntityModel from '@common/domain/models/pii-entity.model';

@Injectable()
export default class ArchiveGeneratorService {
  // eslint-disable-next-line class-methods-use-this
  generateArchive(input: {
    anonymizedText: string;
    piiEntityModels: PiiEntityModel[];
  }): Buffer {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { anonymizedText, piiEntityModels } = input;

    // TODO: Replace this placeholder implementation with actual logic

    const mockZipBuffer = Buffer.from([
      0x50, 0x4b, 0x03, 0x04, 0x0a, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ]);

    return mockZipBuffer;
  }
}
