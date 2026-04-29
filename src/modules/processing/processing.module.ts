import { Module } from '@nestjs/common';
import AnonymizationModule from '@modules/anonymization/anonymization.module';
import ProcessingService from './processing.service';
import ProcessingController from './processing.controller';
import ComplianceModule from '../compliance/compliance.module';
import UserModule from '../user/user.module';

@Module({
  imports: [AnonymizationModule, ComplianceModule, UserModule],
  providers: [ProcessingService],
  controllers: [ProcessingController],
})
export default class ProcessingModule {}
