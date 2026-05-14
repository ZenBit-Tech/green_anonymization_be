import { Module } from '@nestjs/common';
import FileGenerationController from './file-generation.controller';
import FileGenerationService from './file-generation.service';
import ArchiveGeneratorService from './archive-generator.service';
import DocumentsModule from '../documents/documents.module';

@Module({
  controllers: [FileGenerationController],
  providers: [FileGenerationService, ArchiveGeneratorService],
  imports: [DocumentsModule],
})
export default class FileGenerationModule {}
