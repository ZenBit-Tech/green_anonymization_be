import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import JwtAuthGuard from '@modules/auth/guards/jwt-auth.guard';

import UserEmail from '@/common/utils/decorators/user-email.decorator';
import SyntheticDataService from './synthetic.service';

import GenerateSyntheticDataRequestDto from './dto/generate-synthetic-data-request.dto';
import GenerateSyntheticDataResponseDto from './dto/generate-synthetic-data-response.dto';

@ApiTags('SyntheticData')
@Controller('synthetic-data')
export default class SyntheticDataController {
  constructor(private readonly syntheticDataService: SyntheticDataService) {}

  @ApiOperation({
    summary: 'Generate synthetic documents from a de-identified document',
    description:
      'Takes anonymized document text and generates synthetic variants preserving structure and entity types.',
  })
  @ApiBody({
    type: GenerateSyntheticDataRequestDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Synthetic documents successfully generated',
    type: GenerateSyntheticDataResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT token',
  })
  @ApiInternalServerErrorResponse({
    description: 'Failed to generate synthetic data',
  })
  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generate(
    @UserEmail() email: string,
    @Body() dto: GenerateSyntheticDataRequestDto,
  ): Promise<GenerateSyntheticDataResponseDto> {
    try {
      return await this.syntheticDataService.generate({
        email,
        documentId: dto.documentId,
        count: dto.count,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to generate synthetic data',
      );
    }
  }
}
