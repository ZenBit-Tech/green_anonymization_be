import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Mailer, createTransport, SentMessageInfo } from 'nodemailer';
import sanitizeHtml from 'sanitize-html';
import ContactMessage from '@entities/contactMessage.entity';
import type CreateContactMessageResponse from './dto/createContactMessageResponse.dto';
import ContactMessageEmailHtml from './utils/contactMessageEmail';
import ContactMessageConfirmationEmailHtml from './utils/contactMessageConfirmationEmail';

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
    private contactMessageRepository: Repository<ContactMessage>,
    private configService: ConfigService,
  ) {}

  private static sanitizeInput(value: string): string {
    return sanitizeHtml(value, {
      allowedTags: [],
      allowedAttributes: {},
    }).trim();
  }

  private async emailTransport(): Promise<Mailer> {
    return createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendMail(
    to: string,
    subject: string,
    html: string,
  ): Promise<SentMessageInfo> {
    try {
      const transport = await this.emailTransport();
      return transport.sendMail({
        from: `"Anonymizer" <${this.configService.get<string>('SMTP_FROM')}>`,
        to,
        subject,
        html,
      });
    } catch (err: unknown) {
      throw new InternalServerErrorException(
        `Failed to send email, error: ${err}`,
      );
    }
  }

  async createContactMessage(
    data: ContactMessageInput,
  ): Promise<CreateContactMessageResponse> {
    try {
      return await this.contactMessageRepository.manager.transaction(
        async (tm) => {
          const sanitizedData = {
            firstName: EmailService.sanitizeInput(data.firstName),
            lastName: EmailService.sanitizeInput(data.lastName),
            email: EmailService.sanitizeInput(data.email),
            phoneNumber: EmailService.sanitizeInput(data.phoneNumber),
            message: EmailService.sanitizeInput(data.message),
          };

          const contactMessageRepo = tm.getRepository(ContactMessage);
          const insertResult = await contactMessageRepo
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

          const email = await contactMessageRepo
            .createQueryBuilder('e')
            .where('e.uuid = :uuid', { uuid: id })
            .getOne();

          if (!email) {
            throw new InternalServerErrorException(
              'Email creation failed: could not fetch created record',
            );
          }

          const notificationTarget =
            this.configService.get<string>('SMTP_FROM');

          if (notificationTarget) {
            try {
              await this.sendMail(
                notificationTarget,
                `New Contact Message from ${sanitizedData.firstName} ${sanitizedData.lastName}`,
                ContactMessageEmailHtml(sanitizedData),
              );
            } catch (mailError) {
              this.logger.error(
                `Failed to send contact notification email: ${mailError instanceof Error ? mailError.message : String(mailError)}`,
              );
            }
          }

          try {
            await this.sendMail(
              sanitizedData.email,
              'We received your message',
              ContactMessageConfirmationEmailHtml({
                firstName: sanitizedData.firstName,
                message: sanitizedData.message,
              }),
            );
          } catch (mailError) {
            this.logger.error(
              `Failed to send contact confirmation email: ${mailError instanceof Error ? mailError.message : String(mailError)}`,
            );
          }

          return {
            message: 'Email submission created successfully',
          };
        },
      );
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
