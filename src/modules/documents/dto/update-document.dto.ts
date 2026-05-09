import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

const MAX_TEXT_LENGTH = 1_000_000;

export default class UpdateDocumentDto {
  @ApiProperty({
    description: 'New anonymized text to store in S3',
    maxLength: MAX_TEXT_LENGTH,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_TEXT_LENGTH)
  text: string;
}
