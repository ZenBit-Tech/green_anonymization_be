import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Mailer, createTransport, SentMessageInfo } from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export default class MailService {
  constructor(private configService: ConfigService) {}

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
}
