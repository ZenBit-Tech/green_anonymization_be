import { ApiProperty } from '@nestjs/swagger';

import SyntheticEntityDto from './synthetic-entity.dto';

export default class SyntheticDocumentDto {
  @ApiProperty({ example: 'synthetic-1' })
  id!: string;

  @ApiProperty({ type: [SyntheticEntityDto] })
  entities!: SyntheticEntityDto[];
}
