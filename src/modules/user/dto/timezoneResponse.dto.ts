import { ApiProperty } from '@nestjs/swagger';

export default class TimezoneResponseDto {
  @ApiProperty({ example: 'Europe/Kyiv' })
  timezone: string = '';
}
