import { FileExtensions } from '@/common/constants';
import { IsNotEmpty, IsString } from 'class-validator';

export default class GenerateFileRequestDto {
  @IsString()
  @IsNotEmpty()
  text: string = '';

  @IsString()
  @IsNotEmpty()
  extension: FileExtensions = FileExtensions.TXT;
}
