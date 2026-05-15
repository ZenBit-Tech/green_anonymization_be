import { ApiProperty } from '@nestjs/swagger';

import SyntheticDocumentDto from './synthetic-document.dto';

export default class GenerateSyntheticDataResponseDto {
  @ApiProperty({ type: [SyntheticDocumentDto] })
  syntheticDocuments!: SyntheticDocumentDto[];
}
