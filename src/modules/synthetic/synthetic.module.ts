import { Module } from '@nestjs/common';
import SyntheticDataController from './synthetic.controller';
import SyntheticDataService from './synthetic.service';
import DocumentsModule from '../documents/documents.module';
import ManualGenerationService from './manualGeneration.service';

@Module({
  imports: [DocumentsModule],
  controllers: [SyntheticDataController],
  providers: [SyntheticDataService, ManualGenerationService],
  exports: [SyntheticDataService],
})
export default class SyntheticDataModule {}
