import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import UserService from '@modules/user/user.service';
import MailService from '@modules/mail/mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export default class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  // STEP 1: generate magic link token
  async generateMagicToken(email: string): Promise<string> {
    const payload = { email, type: 'magic' };
    const token = this.jwtService.sign(payload, { expiresIn: '60m' });
    const magicLink = `${this.configService.getOrThrow<string>('FRONTEND_ORIGIN')}/auth/callback?token=${token}`;

    await this.mailService.sendMail(
      email,
      'Your Magic Login Link',
      `<p>Click <a href="${magicLink}">here</a> to login</p>`,
    );

    return token;
  }

  // STEP 2: generate normal access + refresh tokens
  async generateAuthTokens(email: string) {
    const accessPayload = { email, type: 'access' };
    const refreshPayload = { email, type: 'refresh' };

    const accessToken = this.jwtService.sign(accessPayload, {
      expiresIn: '15m',
    });
    const refreshToken = this.jwtService.sign(refreshPayload, {
      expiresIn: '7d',
    });

    const user = await this.userService.findByEmail(email);
    const isRegistered = !!user;

    return { accessToken, refreshToken, isRegistered };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken) as {
        email: string;
        type: string;
      };
      if (payload.type !== 'refresh')
        throw new UnauthorizedException('Invalid token type');

      const newAccessToken = this.jwtService.sign(
        { email: payload.email, type: 'access' },
        { expiresIn: '15m' },
      );
      return { accessToken: newAccessToken };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
