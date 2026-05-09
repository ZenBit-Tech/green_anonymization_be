import { ApiProperty } from '@nestjs/swagger';
import DashboardStatsResponseDto from './dashboard-stats-response.dto';
import EntityTypeStatResponseDto from './entity-type-stat-response.dto';
import ComplianceUsageResponseDto from './compliance-usage-response.dto';
import ProcessingHistoryResponseDto from './processing-history-response.dto';
import ConfidenceRangeResponseDto from './confidence-range-response.dto';
import RecentActivityResponseDto from './recent-activity-response.dto';

export default class DashboardResponseDto {
  @ApiProperty({ type: DashboardStatsResponseDto, nullable: true })
  stats: DashboardStatsResponseDto | null = null;

  @ApiProperty({ type: [EntityTypeStatResponseDto] })
  entityTypes: EntityTypeStatResponseDto[] = [];

  @ApiProperty({
    type: [ComplianceUsageResponseDto],
    description: 'GDPR/HIPAA now; full framework codes after schema update',
  })
  complianceUsage: ComplianceUsageResponseDto[] = [];

  @ApiProperty({ type: [ProcessingHistoryResponseDto] })
  processingHistory: ProcessingHistoryResponseDto[] = [];

  @ApiProperty({ type: [ConfidenceRangeResponseDto] })
  confidenceDistribution: ConfidenceRangeResponseDto[] = [];

  @ApiProperty({ type: [RecentActivityResponseDto] })
  recentActivity: RecentActivityResponseDto[] = [];
}
