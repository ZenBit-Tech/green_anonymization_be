import { IsArray, ArrayNotEmpty, IsString, IsEnum } from 'class-validator';
import { FileExtensions } from '@/common/constants';
import { ApiProperty } from '@nestjs/swagger';

export default class GenerateArchiveRequestDto {
  @ApiProperty({
    description: 'An array of document texts with synthetic data in each',
    required: true,
    example:
      'Patient: Dr. Isabella Lopez\r\nDate of Visit: 2000-10-14T03:16:05.855Z\r\nMedical Record Number: MRN789456123\r\n\r\nChief Complaint:\r\nThe patient is a 1978-07-17T02:49:58.403Z female presenting with persistent headaches.\r\nHistory:\\nPatient reports headaches started 2012-10-16T12:23:22.965Z. \r\n\r\nPrevious medical records from 1974-06-14T02:26:02.479Z indicate hypertension management. \r\nPatient can be reached at 555-123-4567 or dk6c26wo@example.com.\r\nPhysical Address: 123 Medical Center Drive, 742 Evergreen Terrace, Springfield \r\n\r\nAssessment: \r\nRecommend follow-up imaging and blood pressure monitoring. \r\n\r\nSocial Security: 123-45-6789 \r\nPatient ID: 987654321 \r\nNext appointment scheduled for 2007-07-04T20:21:35.504Z at 1976-06-06T16:12:20.827Z."\r\n',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  anonymizedTexts: string[];

  @ApiProperty({
    description: 'A value of enum { txt, pdf, docx }',
    required: true,
    example: 'txt',
  })
  @IsEnum(FileExtensions)
  extension: FileExtensions;
}
