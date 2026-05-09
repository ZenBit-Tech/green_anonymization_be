import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import PIIEntityDto from '@modules/processing/dto/piiEntity.dto';
import DocumentTextDto from './document-text.dto';

export default class DocumentDetailDto extends DocumentTextDto {
  @ApiProperty({ type: [PIIEntityDto] })
  @Expose()
  @Type(() => PIIEntityDto)
  piiEntities: PIIEntityDto[];
}
