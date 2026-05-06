import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import JwtAuthGuard from '@modules/auth/guards/jwt-auth.guard';
import UserEmail from '@common/utils/decorators/user-email.decorator';
import AnalyticsService from './analytics.service';
import DashboardDto from './dto/dashboard.dto';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export default class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @ApiOperation({ summary: 'Get all dashboard data in a single request' })
  @ApiResponse({ status: 200, type: DashboardDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT token' })
  @Get('dashboard')
  getDashboard(@UserEmail() email: string): Promise<DashboardDto> {
    return this.analyticsService.getDashboard(email);
  }
}
