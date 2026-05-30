import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import JwtAuthGuard from '@modules/auth/guards/jwt-auth.guard';
import UserEmail from '@common/utils/decorators/user-email.decorator';
import AnalyticsService from './analytics.service';
import DashboardResponseDto from './dto/dashboard-response.dto';
import AnalyticsPeriodDto from './dto/analytics-period.dto';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export default class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @ApiOperation({
    summary:
      'Get all dashboard data in a single request. Use days=7|14|30 for a preset period, or from+to for a custom date range.',
  })
  @ApiResponse({ status: 200, type: DashboardResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid period parameters (e.g. unsupported days value, missing to when from is provided)',
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT token' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiInternalServerErrorResponse({
    description: 'Failed to load dashboard data',
  })
  @Get('dashboard')
  async getDashboard(
    @UserEmail() email: string,
    @Query() period: AnalyticsPeriodDto,
  ): Promise<DashboardResponseDto> {
    const data = await this.analyticsService.getDashboard(email, period);
    return {
      stats: data.stats,
      entityTypes: data.entityTypes,
      complianceUsage: data.complianceUsage,
      processingHistory: data.processingHistory,
      confidenceDistribution: data.confidenceDistribution,
      recentActivity: data.recentActivity,
      deIdMethodUsage: data.deIdMethodUsage,
    };
  }
}
