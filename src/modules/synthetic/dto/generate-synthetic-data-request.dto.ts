import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Max, Min } from 'class-validator';

export default class GenerateSyntheticDataRequestDto {
  @ApiProperty({
    example: 'document-id',
  })
  @IsString()
  documentId!: string;

  @ApiProperty({
    example: 10,
    minimum: 1,
    maximum: 500,
  })
  @IsInt()
  @Min(1)
  @Max(500)
  count!: number;
}
