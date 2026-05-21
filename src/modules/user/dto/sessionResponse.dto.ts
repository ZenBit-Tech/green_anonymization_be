import User from '@/common/db/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export default class SessionResponseDto {
  @ApiProperty({
    example: true,
  })
  registered: boolean = false;

  @ApiProperty({
    example: null,
  })
  user: User | null = null;
}
