import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import Documents from '@/common/db/entities/documents.entity';
import PIIEntities from '@/common/db/entities/PIIEntities.entity';
import GenerationController from './generation.controller';
import ManualGenerationService from '../synthetic/manualGeneration.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Documents, PIIEntities])],
  providers: [ManualGenerationService],
  controllers: [GenerationController],
  exports: [ManualGenerationService],
})
export default class GenerationModule {}
