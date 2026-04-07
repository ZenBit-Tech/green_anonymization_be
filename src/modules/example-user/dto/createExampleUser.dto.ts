import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export default class CreateExampleUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Unique email of a user',
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(500)
  email: string = '';
}
