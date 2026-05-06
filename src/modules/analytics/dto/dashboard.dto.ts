import { ApiProperty } from '@nestjs/swagger';
import DashboardStatsDto from './dashboard-stats.dto';
import EntityTypeStatDto from './entity-type-stat.dto';
import ComplianceUsageDto from './compliance-usage.dto';
import ProcessingHistoryDto from './processing-history.dto';
import ConfidenceRangeDto from './confidence-range.dto';
import RecentActivityDto from './recent-activity.dto';

export default class DashboardDto {
  @ApiProperty({ type: DashboardStatsDto })
  stats: DashboardStatsDto = new DashboardStatsDto();

  @ApiProperty({ type: [EntityTypeStatDto] })
  entityTypes: EntityTypeStatDto[] = [];

  @ApiProperty({
    type: [ComplianceUsageDto],
    description: 'GDPR/HIPAA now; full framework codes after schema update',
  })
  complianceUsage: ComplianceUsageDto[] = [];

  @ApiProperty({ type: [ProcessingHistoryDto] })
  processingHistory: ProcessingHistoryDto[] = [];

  @ApiProperty({ type: [ConfidenceRangeDto] })
  confidenceDistribution: ConfidenceRangeDto[] = [];

  @ApiProperty({ type: [RecentActivityDto] })
  recentActivity: RecentActivityDto[] = [];
}
