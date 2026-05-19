import { ApiProperty } from '@nestjs/swagger';

import SyntheticEntityDto from './synthetic-entity.dto';

export default class SyntheticDocumentDto {
  @ApiProperty({ example: 'synthetic-1' })
  id!: string;

  @ApiProperty({
    description:
      'anonymized text with each pii entity replaced with synthetic data',
  })
  syntheticText!: string;

  @ApiProperty({ type: [SyntheticEntityDto] })
  entities!: SyntheticEntityDto[];
}
