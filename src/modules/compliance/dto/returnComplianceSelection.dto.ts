import { ApiProperty } from '@nestjs/swagger';
import ReturnComplianceFrameworkDto from './returnComplianceFramework.dto';

export default class ReturnComplianceSelectionDto {
  @ApiProperty({ example: 'user-123' })
  userId: string;

  @ApiProperty({ example: 'HIPAA_US' })
  frameworkCode: string;

  @ApiProperty({
    type: ReturnComplianceFrameworkDto,
    nullable: true,
    required: false,
  })
  framework?: ReturnComplianceFrameworkDto | null;
}
