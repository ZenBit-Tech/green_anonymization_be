import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import PIIEntityDto from '@modules/processing/dto/piiEntity.dto';

export default class DocumentDetailResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  fileName: string;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  fileType?: string;

  @ApiProperty()
  @Expose()
  chosenCompliance: string;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  verifiedAt?: Date;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @ApiProperty({ description: 'Anonymized text content fetched from S3' })
  @Expose()
  anonymizedText: string;

  @ApiProperty({ type: [PIIEntityDto] })
  @Expose()
  @Type(() => PIIEntityDto)
  piiEntities: PIIEntityDto[];
}
