import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import sanitizeHtml from 'sanitize-html';
import ContactMessage from '@entities/contactMessage.entity';
import type CreateContactMessageResponse from './dto/createContactMessageResponse.dto';

interface ContactMessageInput {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  message: string;
}

@Injectable()
export default class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @InjectRepository(ContactMessage)
    private emailRepository: Repository<ContactMessage>,
  ) {}

  private static sanitizeInput(value: string): string {
    return sanitizeHtml(value, {
      allowedTags: [],
      allowedAttributes: {},
    }).trim();
  }

  async createContactMessage(
    data: ContactMessageInput,
  ): Promise<CreateContactMessageResponse> {
    try {
      return await this.emailRepository.manager.transaction(async (tm) => {
        const sanitizedData = {
          firstName: EmailService.sanitizeInput(data.firstName),
          lastName: EmailService.sanitizeInput(data.lastName),
          email: EmailService.sanitizeInput(data.email),
          phoneNumber: EmailService.sanitizeInput(data.phoneNumber),
          message: EmailService.sanitizeInput(data.message),
        };

        const emailRepo = tm.getRepository(ContactMessage);
        const insertResult = await emailRepo
          .createQueryBuilder()
          .insert()
          .into(ContactMessage)
          .values([sanitizedData])
          .execute();

        const id: string = insertResult.identifiers[0]?.uuid;
        if (!id) {
          throw new InternalServerErrorException(
            'Email creation failed: no id returned',
          );
        }

        const email = await emailRepo
          .createQueryBuilder('e')
          .where('e.uuid = :uuid', { uuid: id })
          .getOne();

        if (!email) {
          throw new InternalServerErrorException(
            'Email creation failed: could not fetch created record',
          );
        }

        return {
          message: 'Email submission created successfully',
        };
      });
    } catch (error) {
      this.logger.error(
        `Error creating email: ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
      if (error instanceof InternalServerErrorException) throw error;
      throw new InternalServerErrorException('Failed to create email');
    }
  }
}
