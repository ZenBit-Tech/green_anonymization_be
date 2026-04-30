import { EntityType, Confidence } from '@common/constants';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export default class EntityDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  documentId: string;

  @ApiProperty({ enum: EntityType })
  @Expose()
  entityType: EntityType;

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
