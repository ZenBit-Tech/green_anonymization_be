import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export default class UpdateTimezoneDto {
  @ApiProperty({ example: 'Europe/Kyiv' })
  @IsString()
  @IsNotEmpty()
  timezone: string = '';
}
