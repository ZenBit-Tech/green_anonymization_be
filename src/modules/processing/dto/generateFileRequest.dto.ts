import { FileExtensions } from '@/common/constants';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export default class GenerateFileRequestDto {
  @ApiProperty({
    description: 'Text content to generate into a file',
    example: 'Hello world',
  })
  @IsString()
  @IsNotEmpty()
  text: string = '';

  @ApiProperty({
    enum: FileExtensions,
    enumName: 'FileExtensions',
    example: FileExtensions.PDF,
    description: 'File extension / output format',
  })
  @IsString()
  @IsNotEmpty()
  extension: FileExtensions = FileExtensions.TXT;
}
