import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import ComplianceService from '@modules/compliance/compliance.service';
import UserEmail from '@/common/utils/decorators/user-email.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';
import AnonymizeRequestDto from './dto/anonymizeRequest.dto';
import AnonymizeResponseDto from './dto/anonymizeResponse.dto';
import DocumentDto from './dto/document.dto';
import extractTextFromFile from './utils/file-text';
import ProcessingService from './processing.service';
import JwtAuthGuard from '../auth/guards/jwt-auth.guard';
import PIIEntityDto from './dto/piiEntity.dto';

@ApiTags('Processing')
@Controller('processing')
export default class ProcessingController {
  constructor(
    private readonly processingService: ProcessingService,
    private readonly complianceService: ComplianceService,
  ) {}

  @ApiOperation({
    summary:
      'Process medical or sensitive text using selected compliance framework and anonymizer',
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
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async anonymize(
    @UserEmail() email: string,
    @UploadedFile() file?: Express.Multer.File,
    @Body() data?: AnonymizeRequestDto,
  ): Promise<AnonymizeResponseDto> {
    // const selection = await this.complianceService.getSelectionByEmail(email);

    if (!data?.selectedFrameworkCode) {
      throw new BadRequestException('No framework selected');
    }
    const selectedFramework = await this.complianceService.getFrameworkByCode(
      data.selectedFrameworkCode,
    );
    if (!selectedFramework) {
      throw new BadRequestException('Framework with selected code not found');
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
    let result;
    try {
      result = await this.processingService.process(
        selectedFramework,
        input,
        email,
        file?.originalname,
      );
    } catch (err) {
      throw new InternalServerErrorException('Anonymization processing failed');
    }

    return plainToInstance(AnonymizeResponseDto, {
      originalText: result.originalText,
      anonymizedText: result.anonymizedText,
      document: plainToInstance(DocumentDto, result.document, {
        excludeExtraneousValues: true,
      }),
      piiEntities: plainToInstance(PIIEntityDto, result.piiEntities, {
        excludeExtraneousValues: true,
      }),
    });
  }
}
