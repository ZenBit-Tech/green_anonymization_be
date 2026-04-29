import { ApiProperty } from '@nestjs/swagger';
import DocumentDto from './document.dto';
import EntityDto from './entity.dto';

export default class AnonymizeResponseDto {
  @ApiProperty()
  originalText: string;

  @ApiProperty()
  anonymizedText: string;

  @ApiProperty({ type: DocumentDto })
  document: DocumentDto;

  @ApiProperty({ type: [EntityDto] })
  entities: EntityDto[];
}
