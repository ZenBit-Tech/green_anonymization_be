import { Module } from '@nestjs/common';
import AnonymizationModule from '@modules/anonymization/anonymization.module';
import Documents from '@/common/db/entities/documents.entity';
import Entities from '@/common/db/entities/entities.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import ProcessingService from './processing.service';
import ProcessingController from './processing.controller';
import ComplianceModule from '../compliance/compliance.module';
import UserModule from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Documents, Entities]),
    AnonymizationModule,
    ComplianceModule,
    UserModule,
  ],
  providers: [ProcessingService],
  controllers: [ProcessingController],
})
export default class ProcessingModule {}
