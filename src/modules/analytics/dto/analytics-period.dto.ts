import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  ANALYTICS_ACTIVITY_LIMIT_MAX,
  ANALYTICS_RECENT_ACTIVITY_LIMIT,
} from '../constants/analytics.constants';

export default class AnalyticsPeriodDto {
  @ApiPropertyOptional({
    enum: [7, 14, 30],
    description: 'Preset period in days. Ignored when from/to are provided.',
    example: 7,
  })
  @IsOptional()
  @Transform(({ value }): number => Number(value))
  @IsIn([7, 14, 30])
  days?: 7 | 14 | 30;

  @ApiPropertyOptional({
    description:
      'Custom range start date (ISO 8601). Must be used together with "to".',
    example: '2026-04-01',
  })
  @ValidateIf((o: AnalyticsPeriodDto) => !!o.to)
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    description:
      'Custom range end date (ISO 8601). Must be used together with "from".',
    example: '2026-04-30',
  })
  @ValidateIf((o: AnalyticsPeriodDto) => !!o.from)
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({
    description: `Max number of recent activity items to return. Default: ${ANALYTICS_RECENT_ACTIVITY_LIMIT}, max: ${ANALYTICS_ACTIVITY_LIMIT_MAX}.`,
    example: 30,
  })
  @IsOptional()
  @Transform(({ value }): number => Number(value))
  @IsInt()
  @Min(1)
  @Max(ANALYTICS_ACTIVITY_LIMIT_MAX)
  activityLimit?: number;
}
