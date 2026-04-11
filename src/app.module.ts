import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import ExampleUserModule from '@modules/example-user/example.user.module';
import { dataSourceOptions } from '@common/db/datasource';
import ExampleUserController from '@modules/example-user/example.user.controller';
import AuthModule from '@modules/auth/auth.module';
import MailModule from '@modules/mail/mail.module';
import UserController from '@modules/user/user.controller';
import UserModule from '@modules/user/user.module';
import ComplianceModule from '@modules/compliance/compliance.module';
import AppService from './app.service';
import AppController from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(dataSourceOptions),
    ExampleUserModule,
    UserModule,
    AuthModule,
    MailModule,
    ComplianceModule,
  ],
  controllers: [AppController, ExampleUserController, UserController],
  providers: [AppService],
})
export default class AppModule {}
