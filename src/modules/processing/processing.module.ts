import { Module } from '@nestjs/common';
import AnonymizationModule from '@modules/anonymization/anonymization.module';
import Documents from '@/common/db/entities/documents.entity';
import PIIEntities from '@/common/db/entities/PIIEntities.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import PricingModule from '@modules/pricing/pricing.module';
import ProcessingService from './processing.service';
import ProcessingController from './processing.controller';
import ComplianceModule from '../compliance/compliance.module';
import UserModule from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Documents, PIIEntities]),
    AnonymizationModule,
    ComplianceModule,
    UserModule,
    PricingModule,
  ],
  providers: [ProcessingService],
  controllers: [ProcessingController],
})
export default class ProcessingModule {}
