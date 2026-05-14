import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import FileGenerationService from './file-generation.service';
import UserEmail from '../../common/utils/decorators/user-email.decorator';
import JwtAuthGuard from '../auth/guards/jwt-auth.guard';

@ApiTags('File Generation')
@Controller('file-generation')
export default class FileGenerationController {
  constructor(private readonly fileGenerationService: FileGenerationService) {}

  @ApiOperation({
    summary:
      'Generate archive with multiple file formats containing synthetic data for a requested document',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the document',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully generated archive containing synthetic data',
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
    description: 'Invalid document ID or user email',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized to access requested document',
  })
  @ApiNotFoundResponse({
    description: 'Document or user not found',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error occured during archive generation',
  })
  @UseGuards(JwtAuthGuard)
  @Get('generate-archive/:id')
  async generateArchive(
    @Param('id') documentId: string,
    @UserEmail() userEmail: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const archive = await this.fileGenerationService.generateArchive({
        documentId,
        userEmail,
      });

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="archive.zip"`,
      );
      res.send(archive);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException('Invalid document ID or user email');
      }

      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(
          'Unauthorized to access requested document',
        );
      }

      if (error instanceof NotFoundException) {
        throw new NotFoundException('Document or user not found');
      }

      throw new InternalServerErrorException(
        'Internal server error occured during archive generation',
      );
    }
  }
}
