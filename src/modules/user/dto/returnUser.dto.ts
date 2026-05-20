import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export default class ReturnUserDto {
  @ApiProperty({
    example: 'test@example.com',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string = '';

  @ApiProperty({
    example: 'John',
  })
  @IsString()
  firstName: string = '';

  @ApiProperty({
    example: 'Doe',
  })
  @IsString()
  lastName: string = '';

  @ApiProperty({
    example: 'Acme Inc.',
  })
  @IsString()
  companyName: string = '';

  @ApiPropertyOptional({
    example: {
      skipped: false,
      dashboard: true,
      deidentification: false,
      results: false,
      synthetic: false,
    },
  })
  workflowTour?: {
    skipped: boolean;
    dashboard: boolean;
    deidentification: boolean;
    results: boolean;
    synthetic: boolean;
  };
}
