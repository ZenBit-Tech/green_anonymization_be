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
import ComplianceService from '../compliance/compliance.service';
import AnonymizationService from './anonymization.service';
import extractTextFromFile from './utils/file-text';
import AnonymizeRequestDto from './dto/anonymizeRequest.dto';
import AnonymizeResponseDto from './dto/anonymizeResponse.dto';
import mapFramework from './utils/mapFrameworks';
import DocumentDto from './dto/document.dto';
import EntityDto from './dto/entity.dto';

@ApiTags('Anonymization')
@Controller('anonymization')
export default class AnonymizationController {
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
      'Returns original and nonymized text, document db object and db objects of every found entity',
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

      let input = '';
      try {
        if (file) {
          input = await extractTextFromFile(file);
        } else {
          input = data?.text ?? '';
        }
      } catch (err) {
        throw new BadRequestException('Failed to extract text from input');
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

      throw new BadRequestException(
        err?.message || 'Anonymization request failed',
      );
    }
  }
}
