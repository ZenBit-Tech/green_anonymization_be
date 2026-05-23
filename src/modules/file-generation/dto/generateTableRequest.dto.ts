import SyntheticEntityDto from '@/modules/synthetic/dto/synthetic-entity.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';

export default class GenerateTableRequestDto {
  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyntheticEntityDto)
  syntheticEntities: SyntheticEntityDto[][];
}
