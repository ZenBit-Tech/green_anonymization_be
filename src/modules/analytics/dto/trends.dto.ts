import { ApiProperty } from '@nestjs/swagger';

export default class TrendsDto {
  @ApiProperty({
    nullable: true,
    description: '% change vs previous month. null if no prior data',
  })
  documentsVsLastMonth: number | null = null;

  @ApiProperty({
    nullable: true,
    description: '% change vs previous month. null if no prior data',
  })
  entitiesVsLastMonth: number | null = null;
}
