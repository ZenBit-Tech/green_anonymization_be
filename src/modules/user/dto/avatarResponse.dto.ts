import { ApiProperty } from '@nestjs/swagger';

export default class AvatarResponseDto {
  @ApiProperty({
    example: 'https://bucket.s3.region.amazonaws.com/avatars/uuid.jpg',
  })
  avatarUrl: string = '';
}
