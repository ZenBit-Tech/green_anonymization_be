import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export default class LoginRequestDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address to send the magic login link to',
  })
  @IsEmail()
  destination: string = '';
}
