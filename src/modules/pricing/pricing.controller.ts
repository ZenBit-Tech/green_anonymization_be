import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import JwtAuthGuard from '@modules/auth/guards/jwt-auth.guard';
import UserEmail from '@common/utils/decorators/user-email.decorator';
import PricingService from './pricing.service';
import SelectPlanDto from './dto/select-plan.dto';
import SubscriptionPlanResponseDto from './dto/subscription-plan-response.dto';
import CurrentSubscriptionResponseDto from './dto/current-subscription-response.dto';

@ApiTags('Pricing')
@Controller('pricing')
export default class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @ApiOperation({ summary: 'Get all available subscription plans' })
  @ApiOkResponse({ type: [SubscriptionPlanResponseDto] })
  @Get('plans')
  async getPlans(): Promise<SubscriptionPlanResponseDto[]> {
    return this.pricingService.getPlans();
  }

  @ApiOperation({ summary: 'Get current user subscription and daily usage' })
  @ApiOkResponse({ type: CurrentSubscriptionResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT token' })
  @ApiNotFoundResponse({ description: 'No active subscription found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('current')
  async getCurrent(
    @UserEmail() email: string,
  ): Promise<CurrentSubscriptionResponseDto> {
    return this.pricingService.getCurrentSubscription(email);
  }

  @ApiOperation({ summary: 'Select a subscription plan' })
  @ApiOkResponse({ type: CurrentSubscriptionResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT token' })
  @ApiNotFoundResponse({ description: 'Plan not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('select')
  async selectPlan(
    @UserEmail() email: string,
    @Body() dto: SelectPlanDto,
  ): Promise<CurrentSubscriptionResponseDto> {
    return this.pricingService.selectPlan(email, dto.planId);
  }
}
