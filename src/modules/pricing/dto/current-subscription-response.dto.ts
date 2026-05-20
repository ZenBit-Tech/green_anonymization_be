import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionStatus } from '../constants/pricing.constants';
import SubscriptionPlanResponseDto from './subscription-plan-response.dto';

export default class CurrentSubscriptionResponseDto {
  @ApiProperty({ enum: SubscriptionStatus })
  status!: SubscriptionStatus;

  @ApiProperty({ nullable: true, description: 'null = never expires (Free)' })
  expiresAt!: Date | null;

  @ApiProperty({ type: SubscriptionPlanResponseDto })
  plan!: SubscriptionPlanResponseDto;

  @ApiProperty({ description: 'Documents anonymized today' })
  usedToday!: number;

  @ApiProperty({
    nullable: true,
    description: 'Daily limit. null = unlimited',
  })
  dailyLimit!: number | null;

  @ApiProperty({
    nullable: true,
    description:
      'ISO 8601 datetime when the daily limit resets. null if unlimited plan.',
    example: '2026-05-16T00:00:00.000Z',
  })
  resetAt!: string | null;

  @ApiProperty({
    description: 'IANA timezone of the user used to calculate resetAt',
    example: 'Europe/Kiev',
  })
  timezone!: string;
}
