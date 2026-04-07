import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export default class MailService {
  constructor(private configService: ConfigService) {}

  emailTransport() {
    return nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    const transport = this.emailTransport();
    return transport.sendMail({
      from: `"Anonimizer" <${this.configService.get<string>('SMTP_FROM')}>`,
      to,
      subject,
      html,
    });
  }
}
