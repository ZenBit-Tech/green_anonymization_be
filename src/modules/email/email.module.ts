import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import ContactMessage from '@entities/contactMessage.entity';
import EmailService from './email.service';
import EmailController from './email.controller';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([ContactMessage])],
  providers: [EmailService],
  controllers: [EmailController],
  exports: [EmailService],
})
export default class EmailModule {}
