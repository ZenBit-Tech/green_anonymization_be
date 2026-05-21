import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export default class CreateAccountDto {
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
}
