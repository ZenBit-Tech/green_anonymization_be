import { ApiProperty } from '@nestjs/swagger';

export default class ProcessingHistoryDto {
  @ApiProperty({ description: 'Date in YYYY-MM-DD format' })
  date: string = '';

  @ApiProperty()
  documents: number = 0;

  @ApiProperty()
  entities: number = 0;
}
