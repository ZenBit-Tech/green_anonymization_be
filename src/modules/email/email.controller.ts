import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import EmailService from './email.service';
import CreateContactMessageDto from './dto/createContactMessage.dto';
import CreateContactMessageResponseDto from './dto/createContactMessageResponse.dto';

@ApiTags('emails')
@Controller('emails/contact-message')
export default class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @ApiOperation({ summary: 'Submit an contact messages' })
  @ApiCreatedResponse({
    description: 'Contact messages successfully submitted',
    type: CreateContactMessageResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @ApiTooManyRequestsResponse({ description: 'Too many requests from this IP' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Throttle({ default: { limit: 5, ttl: 3600000 } })
  @Post()
  async createContactMessage(
    @Body() body: CreateContactMessageDto,
  ): Promise<CreateContactMessageResponseDto> {
    return this.emailService.createContactMessage(body);
  }
}
