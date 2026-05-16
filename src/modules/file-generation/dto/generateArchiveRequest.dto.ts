import { FileExtensions } from '@/common/constants';

export default class GenerateArchiveRequestDto {
  documentId: string;

  anonymizedTexts: string[];

  extension: FileExtensions;
}
