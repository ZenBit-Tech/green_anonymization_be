import { PIIEntityType, Confidence } from '@common/constants';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export default class PIIEntityDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  documentId: string;

  @ApiProperty({ enum: PIIEntityType })
  @Expose()
  entityType: PIIEntityType;

  @ApiProperty()
  @Expose()
  start: number;

  @ApiProperty()
  @Expose()
  end: number;

  @ApiProperty()
  @Expose()
  score: number;

  @ApiProperty({ enum: Confidence })
  @Expose()
  confidence: Confidence;

  @ApiProperty()
  @Type(() => Date)
  @Expose()
  createdAt: Date;
}
