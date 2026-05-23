import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export default class SyntheticEntityDto {
  @ApiProperty({ example: 'PERSON' })
  @IsString()
  entity_type!: string;

  @ApiProperty({ example: 'John Doe 1' })
  @IsString()
  value!: string;
}
