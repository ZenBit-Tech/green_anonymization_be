import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export default class VerifyResponseDto {
  @ApiProperty({
    example: 'Authenticated successfully',
    description: 'Short message to describe verification response',
  })
  @Expose()
  message: string = '';

  @ApiProperty({
    example: 'GjiVCsmcv7wqmbY2lJ4BavVXaEmNAk4WOCL6CwrVnHs',
    description: 'jwt token used to verify user identity',
  })
  @Expose()
  accessToken: string = '';

  @ApiProperty({
    example: 'GjiVCsmcv7wqmbY2lJ4BavVXaEmNAk4WOCL6CwrVnHs',
    description:
      'another kwt token, that could be used to regenerate accessToken after it has been expired',
  })
  @Expose()
  refreshToken: string = '';
}
