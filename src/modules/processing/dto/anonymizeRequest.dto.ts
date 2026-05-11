import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export default class AnonymizeRequestDto {
  @ApiProperty({
    description: 'Compliance framework code. Falls back to user default if omitted.',
    required: false,
    example: 'GDPR_EU',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  selectedFrameworkCode?: string;

  @ApiProperty({
    description: 'Raw text to anonymize (used if no file is uploaded)',
    required: false,
    example: 'Patient name is John Doe...',
  })
  @IsString()
  @IsOptional()
  text?: string;
}
