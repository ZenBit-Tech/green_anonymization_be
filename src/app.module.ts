import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import AppController from './app.controller';
import AppService from './app.service';
import ExampleUserModule from './modules/example-user/example.user.module';
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
    TypeOrmModule.forRoot(dataSourceOptions),
    ExampleUserModule,
    ComplianceModule,
  ],
  controllers: [AppController, ExampleUserController],
  providers: [AppService],
})
export default class AppModule {}
