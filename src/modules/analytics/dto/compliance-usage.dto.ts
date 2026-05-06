import { ApiProperty } from '@nestjs/swagger';

export default class ComplianceUsageDto {
  @ApiProperty({
    description: 'GDPR or HIPAA (full framework codes after PR#14 fix)',
  })
  frameworkCode: string = '';

  @ApiProperty()
  count: number = 0;

  @ApiProperty()
  percentage: number = 0;
}
