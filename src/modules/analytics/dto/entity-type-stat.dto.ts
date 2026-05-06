import { ApiProperty } from '@nestjs/swagger';

export default class EntityTypeStatDto {
  @ApiProperty({ description: 'PIIEntityType enum value or OTHER' })
  entityType: string = '';

  @ApiProperty()
  count: number = 0;
}
