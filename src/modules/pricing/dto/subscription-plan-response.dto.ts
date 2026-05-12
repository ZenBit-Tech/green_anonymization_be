import { ApiProperty } from '@nestjs/swagger';
import { FeatureKey, PlanName } from '../constants/pricing.constants';

export default class SubscriptionPlanResponseDto {
  @ApiProperty()
  uuid: string = '';

  @ApiProperty({ enum: PlanName })
  name: PlanName = PlanName.FREE;

  @ApiProperty({ description: 'Price in cents (0 = free)' })
  priceCents: number = 0;

  @ApiProperty({
    nullable: true,
    description: 'Max documents per day. null = unlimited',
  })
  documentsPerDay: number | null = null;

  @ApiProperty({ type: [String] })
  features: FeatureKey[] = [];
}
