import { ApiProperty } from '@nestjs/swagger';
import TrendsResponseDto from './trends-response.dto';

export default class DashboardStatsResponseDto {
  @ApiProperty()
  totalDocuments: number = 0;

  @ApiProperty()
  totalEntities: number = 0;

  @ApiProperty()
  avgEntitiesPerDoc: number = 0;

  @ApiProperty({
    description: 'Percentage of successfully processed documents',
  })
  successRate: number = 100;

  @ApiProperty({ type: TrendsResponseDto })
  trends: TrendsResponseDto = new TrendsResponseDto();
}
