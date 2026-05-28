import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export default class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  lastName?: string;

  @ApiPropertyOptional({ example: 'Acme Inc.' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  companyName?: string;
}
