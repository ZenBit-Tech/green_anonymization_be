import {
  IsUUID,
  IsArray,
  ArrayNotEmpty,
  IsString,
  IsEnum,
} from 'class-validator';
import { FileExtensions } from '@/common/constants';

export default class GenerateArchiveRequestDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  anonymizedTexts: string[];

  @IsEnum(FileExtensions)
  extension: FileExtensions;
}
