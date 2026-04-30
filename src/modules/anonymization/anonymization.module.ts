import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import AnonymizationService from './anonymization.service';
import PresidioAnonymizerService from './presidio-anonymizer.service';
import ANONYMIZER_SERVICES_TOKEN from './anonymizer-services.token';
import anonymizationConfig from './anonymization.config';

@Module({
  imports: [ConfigModule.forFeature(anonymizationConfig), HttpModule],
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
  controllers: [],
})
export default class AnonymizationModule {}
