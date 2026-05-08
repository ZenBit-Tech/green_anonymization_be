import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import {
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

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export default class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @ApiOperation({ summary: 'Get all dashboard data in a single request' })
  @ApiResponse({ status: 200, type: DashboardResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT token' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiInternalServerErrorResponse({
    description: 'Failed to load dashboard data',
  })
  @Get('dashboard')
  async getDashboard(@UserEmail() email: string): Promise<DashboardResponseDto> {
    const data = await this.analyticsService.getDashboard(email);
    return {
      stats: data.stats,
      entityTypes: data.entityTypes,
      complianceUsage: data.complianceUsage,
      processingHistory: data.processingHistory,
      confidenceDistribution: data.confidenceDistribution,
      recentActivity: data.recentActivity,
    };
  }
}
