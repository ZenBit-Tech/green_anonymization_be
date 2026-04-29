import UserEmail from '@common/utils/decorators/user-email.decorator';
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import ComplianceService from '@modules/compliance/compliance.service';
import AnonymizationService from '@modules/anonymization/anonymization.service';
import AnonymizeResponseDto from './dto/anonymizeResponse.dto';
import AnonymizeRequestDto from './dto/anonymizeRequest.dto';
import extractTextFromFile from './utils/file-text';
import mapFramework from './utils/mapFrameworks';
import DocumentDto from './dto/document.dto';
import EntityDto from './dto/entity.dto';

@ApiTags('Processing')
@Controller('processing')
export default class ProcessingController {
  constructor(
    private readonly anonymizationService: AnonymizationService,
    private readonly complianceService: ComplianceService,
  ) {}

  @ApiOperation({
    summary:
      'Anonymize medical or sensitive text using selected compliance framework',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File upload or raw text input',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Optional file to anonymize',
        },
        text: {
          type: 'string',
          description: 'Optional raw text input if no file is provided',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns original and anonymized text, document db object and db objects of every found entity',
    type: AnonymizeResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input, missing framework, or malformed request',
  })
  @ApiNotFoundResponse({
    description: 'User or compliance selection not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing authentication (email header)',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error during anonymization process',
  })
  @Post('anonymize')
  @UseInterceptors(FileInterceptor('file'))
  async anonymize(
    @UserEmail() email: string,
    @UploadedFile() file?: Express.Multer.File,
    @Body() data?: AnonymizeRequestDto,
  ): Promise<AnonymizeResponseDto> {
    try {
      const selection = await this.complianceService.getSelectionByEmail(email);

      if (!selection.frameworkCode) {
        throw new BadRequestException('No framework selected');
      }

      if (!file && !data?.text) {
        throw new BadRequestException('No input provided');
      }

      let input: string;

      if (file) {
        try {
          input = await extractTextFromFile(file);
        } catch {
          throw new BadRequestException('Failed to extract text from file');
        }
      } else if (data?.text) {
        input = data.text;
      } else {
        throw new BadRequestException('No input provided');
      }
      const result = await this.anonymizationService.anonymize(
        mapFramework(selection.frameworkCode),
        input,
        email,
        file?.originalname,
      );

      return {
        originalText: result.originalText,
        anonymizedText: result.anonymizedText,
        document: plainToInstance(DocumentDto, result.document, {
          excludeExtraneousValues: true,
        }),
        entities: plainToInstance(EntityDto, result.entities, {
          excludeExtraneousValues: true,
        }),
      };
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw err;
      }

      throw new BadRequestException('Anonymization request failed');
    }
  }
}
