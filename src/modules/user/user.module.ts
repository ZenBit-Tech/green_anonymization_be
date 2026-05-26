import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from '@common/db/entities/user.entity';
import S3Service from '@common/services/s3.service';
import UserService from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService, S3Service],
  exports: [UserService, S3Service],
})
export default class UserModule {}
