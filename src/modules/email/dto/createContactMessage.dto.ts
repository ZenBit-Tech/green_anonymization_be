import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export default class CreateContactMessageDto {
  @ApiProperty({ example: 'John', description: 'First name of the sender' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the sender' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName!: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email of the sender',
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email!: string;

  @ApiProperty({
    example: '+15550000000',
    description: 'Phone number with country code',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  phoneNumber!: string;

  @ApiProperty({
    example: 'Tell us more about your needs...',
    description: 'Message from the sender (max 5000 characters)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  message!: string;
}
