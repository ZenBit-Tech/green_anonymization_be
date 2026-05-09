import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import DocumentSummaryDto from './document-summary.dto';

export default class DocumentDetailDto extends DocumentSummaryDto {
  @ApiProperty({ description: 'Anonymized text content fetched from S3' })
  @Expose()
  anonymizedText: string;
}
