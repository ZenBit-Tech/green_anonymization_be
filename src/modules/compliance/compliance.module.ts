import { Module } from '@nestjs/common';
import UserModule from '@modules/user/user.module';
import ComplianceController from './compliance.controller';
import ComplianceService from './compliance.service';

@Module({
  imports: [UserModule],
  controllers: [ComplianceController],
  providers: [ComplianceService],
  exports: [ComplianceService],
})
export default class ComplianceModule {}
