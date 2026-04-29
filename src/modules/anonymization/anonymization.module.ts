import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import ComplianceModule from '@modules/compliance/compliance.module';
import UserModule from '@modules/user/user.module';
import AnonymizationService from './anonymization.service';
import PresidioAnonymizerService from './presidio-anonymizer.service';
import ANONYMIZER_SERVICES_TOKEN from './anonymizer-services.token';
import anonymizationConfig from './anonymization.config';
import AnonymizationController from './anonymizer.controller';

@Module({
  imports: [
    ConfigModule.forFeature(anonymizationConfig),
    HttpModule,
    ComplianceModule,
    UserModule,
  ],
  providers: [
    AnonymizationService,
    PresidioAnonymizerService,
    {
      provide: ANONYMIZER_SERVICES_TOKEN,
      useFactory: (presidioAnonymizerService: PresidioAnonymizerService) => [
        presidioAnonymizerService,
      ],
      inject: [PresidioAnonymizerService],
    },
  ],
  exports: [AnonymizationService],
  controllers: [AnonymizationController],
})
export default class AnonymizationModule {}
