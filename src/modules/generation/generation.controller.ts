import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import ManualGenerationService from './manualGeneration.service';
import GenerateManualDataDto from './dto/generateManualData.dto';

@ApiTags('generation')
@Controller('generation')
export default class GenerationController {
  constructor(
    private readonly manualGenerationService: ManualGenerationService,
  ) {}

  @Post('manual')
  @ApiBody({ type: GenerateManualDataDto })
  @ApiOkResponse({
    description: 'Returns synthetic version of input text',
  })
  async generateManual(@Body() body: GenerateManualDataDto) {
    const result = await this.manualGenerationService.generateManualData(
      body.text,
      body.piiEntities,
    );

    return {
      syntheticText: result.syntheticText,
      generatedEntities: result.generatedEntities,
    };
  }
}
