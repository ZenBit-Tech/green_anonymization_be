import {
  ApiBadRequestResponse,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  NotFoundException,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import JwtAuthGuard from '@modules/auth/guards/jwt-auth.guard';
import type { Response } from 'express';
import FileGenerationService from './file-generation.service';
import GenerateArchiveRequestDto from './dto/generateArchiveRequest.dto';
import GenerateTableRequestDto from './dto/generateTableRequest.dto';

@ApiTags('File Generation')
@Controller('file-generation')
export default class FileGenerationController {
  constructor(private readonly fileGenerationService: FileGenerationService) {}

  @ApiOperation({
    summary: 'Generate ZIP archive containing synthetic files (TXT, PDF, DOCX)',
    description:
      'Converts synthetic texts into files and returns them packaged as a ZIP archive.',
  })
  @ApiBody({
    type: GenerateArchiveRequestDto,
  })
  @ApiResponse({
    status: 200,
    description: 'ZIP archive successfully generated',
    content: {
      'application/zip': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Invalid request: missing texts, empty input, or unsupported file extension',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT token',
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error during archive generation',
  })
  @UseGuards(JwtAuthGuard)
  @Post('generate-archive')
  async generateArchive(
    @Body() input: GenerateArchiveRequestDto,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const { anonymizedTexts, extension } = input;

      const archive = await this.fileGenerationService.generateArchive({
        anonymizedTexts,
        extension,
      });

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="archive.zip"`,
      );

      res.send(archive);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException('Invalid request');
      }

      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException('Unauthorized');
      }

      if (error instanceof NotFoundException) {
        throw new NotFoundException('Not found');
      }

      throw new InternalServerErrorException(
        `Internal server error occured during archive generation`,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('generate-table')
  async generateTable(
    @Body() input: GenerateTableRequestDto,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const { syntheticEntities } = input;

      const table =
        await this.fileGenerationService.generateTable(syntheticEntities);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="synthetic-data-table.xlsx"`,
      );

      res.send(table);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException('Invalid request');
      }

      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException('Unauthorized');
      }

      if (error instanceof NotFoundException) {
        throw new NotFoundException('Not found');
      }

      throw new InternalServerErrorException(
        `Internal server error occured during table generation`,
      );
    }
  }
}
