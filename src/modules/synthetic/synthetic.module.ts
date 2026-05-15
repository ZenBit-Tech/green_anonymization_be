import { Module } from '@nestjs/common';
import SyntheticDataController from './synthetic.controller';
import SyntheticDataService from './synthetic.service';

@Module({
  controllers: [SyntheticDataController],
  providers: [SyntheticDataService],
})
export default class SyntheticDataModule {}
