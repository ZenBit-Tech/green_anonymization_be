import { Module } from '@nestjs/common';
import AnonymizationModule from '@modules/anonymization/anonymization.module';
import DocumentsModule from '@modules/documents/documents.module';
import Documents from '@/common/db/entities/documents.entity';
import PIIEntities from '@/common/db/entities/PIIEntities.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import ComplianceModule from '@modules/compliance/compliance.module';
import UserModule from '@modules/user/user.module';
import ProcessingService from './processing.service';
import ProcessingController from './processing.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Documents, PIIEntities]),
    AnonymizationModule,
    ComplianceModule,
    UserModule,
    DocumentsModule,
  ],
  providers: [ProcessingService],
  controllers: [ProcessingController],
})
export default class ProcessingModule {}
