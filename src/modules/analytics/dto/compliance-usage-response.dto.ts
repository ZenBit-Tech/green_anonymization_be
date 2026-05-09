import { ApiProperty } from '@nestjs/swagger';

export default class ComplianceUsageResponseDto {
  @ApiProperty({ description: 'Compliance framework code (e.g. GDPR, HIPAA)' })
  frameworkCode: string = '';

  @ApiProperty()
  count: number = 0;

  @ApiProperty()
  percentage: number = 0;
}
