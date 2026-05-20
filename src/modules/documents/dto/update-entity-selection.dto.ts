import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export default class UpdateEntitySelectionDto {
  @ApiProperty({
    type: [String],
    description: 'UUIDs of selected PII entities',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  selectedEntityIds: string[];
}
