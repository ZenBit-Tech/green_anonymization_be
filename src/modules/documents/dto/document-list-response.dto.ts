import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import DocumentSummaryDto from './document-summary.dto';

export default class DocumentListResponseDto {
  @ApiProperty({ type: [DocumentSummaryDto] })
  @Expose()
  @Type(() => DocumentSummaryDto)
  items: DocumentSummaryDto[];

  @ApiProperty()
  @Expose()
  total: number;

  @ApiProperty()
  @Expose()
  page: number;

  @ApiProperty()
  @Expose()
  limit: number;
}
