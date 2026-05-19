import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Documents from '@common/db/entities/documents.entity';
import PIIEntities from '@common/db/entities/PIIEntities.entity';
import S3Service from '@common/services/s3.service';
import UserModule from '@modules/user/user.module';
import AuthModule from '@modules/auth/auth.module';
import DocumentsController from './documents.controller';
import DocumentsService from './documents.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Documents, PIIEntities]),
    UserModule,
    AuthModule,
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService, S3Service],
  exports: [DocumentsService],
})
export default class DocumentsModule {}
