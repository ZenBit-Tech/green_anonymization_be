import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export default class SelectPlanDto {
  @ApiProperty({ description: 'UUID of the subscription plan to select' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  planId: string = '';
}
