import { IsString } from 'class-validator';

export default class CreateAccountDto {
  @IsString()
  firstName: string = '';

  @IsString()
  lastName: string = '';

  @IsString()
  companyName: string = '';
}
