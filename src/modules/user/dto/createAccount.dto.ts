import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export default class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string = '';

  @IsString()
  firstName: string = '';

  @IsString()
  lastName: string = '';

  @IsString()
  companyName: string = '';
}
