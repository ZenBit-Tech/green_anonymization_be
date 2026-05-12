import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionStatus } from '../constants/pricing.constants';
import SubscriptionPlanResponseDto from './subscription-plan-response.dto';

export default class CurrentSubscriptionResponseDto {
  @ApiProperty({ enum: SubscriptionStatus })
  status: SubscriptionStatus = SubscriptionStatus.ACTIVE;

  @ApiProperty({ nullable: true, description: 'null = never expires (Free)' })
  expiresAt: Date | null = null;

  @ApiProperty({ type: SubscriptionPlanResponseDto })
  plan: SubscriptionPlanResponseDto = new SubscriptionPlanResponseDto();

  @ApiProperty({ description: 'Documents anonymized today' })
  usedToday: number = 0;

  @ApiProperty({
    nullable: true,
    description: 'Daily limit. null = unlimited',
  })
  dailyLimit: number | null = null;
}
