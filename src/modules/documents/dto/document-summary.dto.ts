import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export default class DocumentSummaryDto {
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
}
