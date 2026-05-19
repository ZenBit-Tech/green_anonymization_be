import { Module } from '@nestjs/common';
import DocumentsModule from '@modules/documents/documents.module';
import SyntheticDataModule from '@modules/synthetic/synthetic.module';
import FileGenerationController from './file-generation.controller';
import FileGenerationService from './file-generation.service';
import ArchiveGeneratorService from './archive-generator.service';

@Module({
  controllers: [FileGenerationController],
  providers: [FileGenerationService, ArchiveGeneratorService],
  imports: [DocumentsModule, SyntheticDataModule],
})
export default class FileGenerationModule {}
