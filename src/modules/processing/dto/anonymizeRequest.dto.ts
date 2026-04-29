import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export default class AnonymizeRequestDto {
  @ApiProperty({
    description: 'Raw text to anonymize (used if no file is uploaded)',
    required: false,
    example: 'Patient name is John Doe...',
  })
  @IsString()
  @IsOptional()
  text?: string;
}
