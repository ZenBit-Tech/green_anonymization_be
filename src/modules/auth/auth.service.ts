import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import UserService from '@modules/user/user.service';
import MailService from '@modules/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import {
  ACCESS_TOKEN_EXPIRATION,
  JwtTokenType,
  MAGIC_LINK_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION,
} from '@common/constants';

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  isRegistered: boolean;
};

@Injectable()
export default class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  async generateMagicToken(email: string): Promise<string> {
    const payload = { email, type: JwtTokenType.MAGIC };
    const token = this.jwtService.sign(payload, {
      expiresIn: MAGIC_LINK_EXPIRATION,
    });
    const magicLink = `${this.configService.getOrThrow<string>('FRONTEND_ORIGIN')}/auth-callback?token=${token}`;
    await this.mailService.sendMail(
      email,
      'Your Magic Login Link',
      `<p>Click <a href="${magicLink}">here</a> to login</p>`,
    );

    return token;
  }

  async generateAuthTokens(email: string): Promise<AuthTokens> {
    const accessPayload = { email, type: JwtTokenType.ACCESS };
    const refreshPayload = { email, type: JwtTokenType.REFRESH };

    const accessToken = this.jwtService.sign(accessPayload, {
      expiresIn: ACCESS_TOKEN_EXPIRATION,
    });
    const refreshToken = this.jwtService.sign(refreshPayload, {
      expiresIn: REFRESH_TOKEN_EXPIRATION,
    });

    const user = await this.userService.findByEmail(email);
    const isRegistered = !!user;
    return { accessToken, refreshToken, isRegistered };
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const payload = this.jwtService.verify(refreshToken) as {
        email: string;
        type: string;
      };
      if (payload.type !== JwtTokenType.REFRESH)
        throw new UnauthorizedException('Invalid token type');

      const newAccessToken = this.jwtService.sign(
        { email: payload.email, type: JwtTokenType.ACCESS },
        { expiresIn: ACCESS_TOKEN_EXPIRATION },
      );
      return newAccessToken;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
