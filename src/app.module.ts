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
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import AppService from './app.service';
import AppController from './app.controller';
import EmailModule from '@/modules/email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 3600000,
        limit: 100,
      },
    ]),
    TypeOrmModule.forRoot(dataSourceOptions),
    ExampleUserModule,
    UserModule,
    AuthModule,
    MailModule,
    ComplianceModule,
    EmailModule,
  ],
  controllers: [AppController, ExampleUserController, UserController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export default class AppModule {}
