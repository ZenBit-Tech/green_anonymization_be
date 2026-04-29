import { ApiProperty } from '@nestjs/swagger';
import { Compliance } from '@common/constants';
import { Expose, Type } from 'class-transformer';

export default class DocumentDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  userId: string;

  @ApiProperty({ enum: Compliance })
  @Expose()
  chosenCompliance: Compliance;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  fileType?: string;

  @ApiProperty()
  @Expose()
  fileName: string;

  @ApiProperty()
  @Expose()
  filePath: string;

  @ApiProperty({ required: false, nullable: true })
  @Type(() => Date)
  @Expose()
  verifiedAt?: Date;

  @ApiProperty()
  @Type(() => Date)
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Type(() => Date)
  @Expose()
  updatedAt: Date;
}
