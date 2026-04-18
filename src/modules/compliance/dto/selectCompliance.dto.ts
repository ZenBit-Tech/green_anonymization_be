import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export default class SelectComplianceDto {
  @ApiProperty({
    example: 'HIPAA_US',
    description: 'Compliance framework code',
  })
  @IsString()
  @IsNotEmpty()
  frameworkCode: string;
}
