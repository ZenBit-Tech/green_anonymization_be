import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export default class AnonymizeRequestDto {
  @ApiProperty({
    description: 'The code of chosen framework',
    required: true,
    example: 'GDPR_EU',
  })
  @IsString()
  @IsNotEmpty()
  selectedFrameworkCode: string;

  @ApiProperty({
    description: 'Raw text to anonymize (used if no file is uploaded)',
    required: false,
    example: 'Patient name is John Doe...',
  })
  @IsString()
  @IsOptional()
  text?: string;
}
