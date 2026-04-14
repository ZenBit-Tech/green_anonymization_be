import { ApiProperty } from '@nestjs/swagger';

export default class CreateContactMessageResponseDto {
  @ApiProperty({
    example: 'Message created successfully',
    description: 'Success message',
  })
  message!: string;
}
