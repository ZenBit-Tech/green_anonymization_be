import { ApiProperty } from '@nestjs/swagger';

export default class SyntheticEntityDto {
  @ApiProperty({ example: 'PERSON' })
  entity_type!: string;

  @ApiProperty({ example: 'John Doe 1' })
  value!: string;
}
