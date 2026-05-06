import { ApiProperty } from '@nestjs/swagger';
import TrendsDto from './trends.dto';

export default class DashboardStatsDto {
  @ApiProperty()
  totalDocuments: number = 0;

  @ApiProperty()
  totalEntities: number = 0;

  @ApiProperty()
  avgEntitiesPerDoc: number = 0;

  @ApiProperty({
    description: 'Always 100 until status field is added to documents table',
  })
  successRate: number = 100;

  @ApiProperty({ type: TrendsDto })
  trends: TrendsDto = new TrendsDto();
}
