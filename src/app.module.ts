import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from '@common/db/datasource';
import AuthModule from '@modules/auth/auth.module';
import UserController from '@modules/user/user.controller';
import UserModule from '@modules/user/user.module';
import ComplianceModule from '@modules/compliance/compliance.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import EmailModule from '@/modules/email/email.module';
import anonymizationConfig from '@modules/anonymization/anonymization.config';
import AnonymizationModule from '@modules/anonymization/anonymization.module';
import ProcessingModule from '@modules/processing/processing.module';
import AppController from './app.controller';
import AppService from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [anonymizationConfig],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 3600000,
        limit: 100,
      },
    ]),
    TypeOrmModule.forRoot(dataSourceOptions),
    UserModule,
    AuthModule,
    ComplianceModule,
    EmailModule,
    AnonymizationModule,
    ProcessingModule,
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
