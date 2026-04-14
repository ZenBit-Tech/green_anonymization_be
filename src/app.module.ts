import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import AppController from './app.controller';
import AppService from './app.service';
import ExampleUserModule from './modules/example-user/example.user.module';
import EmailModule from './modules/email/email.module';
import { dataSourceOptions } from './common/db/datasource';
import ExampleUserController from './modules/example-user/example.user.controller';
import ComplianceModule from './modules/compliance/compliance.module';
import anonymizationConfig from './modules/anonymization/anonymization.config';

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
    ExampleUserModule,
    ComplianceModule,
    EmailModule,
  ],
  controllers: [AppController, ExampleUserController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export default class AppModule {}
