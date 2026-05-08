import { ApiProperty } from '@nestjs/swagger';

export default class RecentActivityResponseDto {
  @ApiProperty()
  id: string = '';

  @ApiProperty()
  fileName: string = '';

  @ApiProperty()
  frameworkCode: string = '';

  @ApiProperty()
  entityCount: number = 0;

  @ApiProperty()
  createdAt: Date = new Date();
}
