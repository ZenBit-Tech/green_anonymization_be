import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Documents from '@common/db/entities/documents.entity';
import PIIEntities from '@common/db/entities/PIIEntities.entity';
import UserModule from '@modules/user/user.module';
import AnalyticsService from './analytics.service';
import AnalyticsController from './analytics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Documents, PIIEntities]), UserModule],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
})
export default class AnalyticsModule {}
