import { IsArray, IsString } from 'class-validator';
import PIIEntities from '@/common/db/entities/PIIEntities.entity';

export default class GenerateManualDataDto {
  @IsString()
  text: string;

  @IsArray()
  piiEntities: PIIEntities[];
}
