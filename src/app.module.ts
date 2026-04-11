import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from '@common/db/datasource';
import AuthModule from '@modules/auth/auth.module';
import MailModule from '@modules/mail/mail.module';
import UserController from '@modules/user/user.controller';
import UserModule from '@modules/user/user.module';
import ComplianceModule from '@modules/compliance/compliance.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import EmailModule from '@/modules/email/email.module';
import AppService from './app.service';
import AppController from './app.controller';

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
    UserModule,
    AuthModule,
    MailModule,
    ComplianceModule,
    EmailModule,
  ],
  controllers: [AppController, UserController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export default class AppModule {}
