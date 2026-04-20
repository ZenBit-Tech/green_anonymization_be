import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import ComplianceSelection from '@common/db/entities/compliance-selection.entity';

import UserModule from '@modules/user/user.module';
import ComplianceController from './compliance.controller';
import ComplianceService from './compliance.service';

@Module({
  imports: [TypeOrmModule.forFeature([ComplianceSelection]), UserModule],
  controllers: [ComplianceController],
  providers: [ComplianceService],
  exports: [ComplianceService],
})
export default class ComplianceModule {}
