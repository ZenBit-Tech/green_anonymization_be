import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import ManualGenerationService from './manualGeneration.service';

@ApiTags('generation')
@Controller('generation')
export default class GenerationController {
  constructor(
    private readonly manualGenerationService: ManualGenerationService,
  ) {}
}
