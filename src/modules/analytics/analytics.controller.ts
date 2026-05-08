import {
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
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
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiInternalServerErrorResponse({
    description: 'Failed to load dashboard data',
  })
  @Get('dashboard')
  async getDashboard(@UserEmail() email: string): Promise<DashboardDto> {
    try {
      return await this.analyticsService.getDashboard(email);
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Failed to load dashboard data');
    }
  }
}
