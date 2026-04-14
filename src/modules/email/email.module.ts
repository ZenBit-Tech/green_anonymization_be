import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import ContactMessage from '@entities/contactMessage.entity';
import EmailService from './email.service';
import EmailController from './email.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ContactMessage])],
  providers: [EmailService],
  controllers: [EmailController],
})
export default class EmailModule {}
