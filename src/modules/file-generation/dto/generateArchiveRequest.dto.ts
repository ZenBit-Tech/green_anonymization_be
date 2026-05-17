import { FileExtensions } from '@/common/constants';
import {
  IsUUID,
  IsArray,
  ArrayNotEmpty,
  IsString,
  IsEnum,
} from 'class-validator';

export default class GenerateArchiveRequestDto {
  @IsUUID()
  documentId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  anonymizedTexts: string[];

  @IsEnum(FileExtensions)
  extension: FileExtensions;
}
