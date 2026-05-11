import { ApiProperty } from '@nestjs/swagger';

export default class DeIdMethodResponseDto {
  @ApiProperty({ description: 'De-identification method (replace, mask, redact, hash)' })
  method: string = '';

  @ApiProperty()
  count: number = 0;

  @ApiProperty()
  percentage: number = 0;
}
