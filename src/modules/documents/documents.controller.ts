import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import JwtAuthGuard from '@modules/auth/guards/jwt-auth.guard';
import UserEmail from '@/common/utils/decorators/user-email.decorator';
import DocumentsService from './documents.service';
import DocumentDetailDto from './dto/document-detail.dto';
import DocumentListResponseDto from './dto/document-list-response.dto';
import DocumentTextDto from './dto/document-text.dto';
import PaginationQueryDto from './dto/pagination-query.dto';
import UpdateDocumentDto from './dto/update-document.dto';

@ApiTags('Documents')
@ApiBearerAuth('jwt')
@ApiUnauthorizedResponse({ description: 'JWT missing or invalid' })
@Controller('documents')
@UseGuards(JwtAuthGuard)
export default class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get paginated list of documents owned by current user',
  })
  @ApiOkResponse({ type: DocumentListResponseDto })
  async findAll(
    @UserEmail() email: string,
    @Query() query: PaginationQueryDto,
  ): Promise<DocumentListResponseDto> {
    return this.documentsService.findAllByEmail(email, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a single document with anonymized text from S3',
  })
  @ApiOkResponse({ type: DocumentDetailDto })
  @ApiNotFoundResponse({
    description: 'Document or anonymized text not found',
  })
  @ApiForbiddenResponse({
    description: 'Document does not belong to current user',
  })
  async findOne(
    @UserEmail() email: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DocumentDetailDto> {
    return this.documentsService.findByIdForEmail(id, email);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Replace anonymized text in S3 for the given document',
  })
  @ApiOkResponse({ type: DocumentTextDto })
  @ApiNotFoundResponse({ description: 'Document not found' })
  @ApiForbiddenResponse({
    description: 'Document does not belong to current user',
  })
  async update(
    @UserEmail() email: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDocumentDto,
  ): Promise<DocumentTextDto> {
    return this.documentsService.updateTextForEmail(id, email, dto.text);
  }
}
