import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import JwtAuthGuard from '@modules/auth/guards/jwt-auth.guard';
import GenerateSyntheticDataDto from './dto/generate-synthetic-data.dto';
import SyntheticDataService from './synthetic.service';

@ApiTags('SyntheticData')
@Controller('synthetic-data')
export default class SyntheticDataController {
  constructor(private readonly syntheticDataService: SyntheticDataService) {}

  @ApiOperation({
    summary: 'Generate synthetic documents from a de-identified document',
  })
  @ApiBody({ type: GenerateSyntheticDataDto })
  @ApiResponse({
    status: 201,
    description: 'Returns generated synthetic documents',
  })
  @ApiUnauthorizedResponse({
    description: 'JWT missing or invalid',
  })
  @Post('generate')
  @UseGuards(JwtAuthGuard)
  generate(@Body() dto: GenerateSyntheticDataDto) {
    return this.syntheticDataService.generate(dto);
  }
}
