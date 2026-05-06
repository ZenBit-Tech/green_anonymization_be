import { ApiProperty } from '@nestjs/swagger';

export default class ConfidenceRangeDto {
  @ApiProperty({
    description: 'Score bucket: 90-100 | 80-90 | 70-80 | 60-70 | <60',
  })
  range: string = '';

  @ApiProperty()
  count: number = 0;
}
