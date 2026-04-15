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

    const html = `
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 0;font-family:Inter, Arial, sans-serif;">
  <tr>
    <td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;padding:32px;">
        
        <!-- Title -->
        <tr>
          <td style="font-size:22px;font-weight:600;color:#101828;padding-bottom:16px;">
            Magic Login Link
          </td>
        </tr>

        <!-- Description -->
        <tr>
          <td style="font-size:16px;color:#6a7282;padding-bottom:24px;">
            Click the button below to securely log in to your account.
            This link will expire in 60 minutes.
          </td>
        </tr>

        <!-- Button -->
        <tr>
          <td align="center" style="padding-bottom:24px;">
            <a href="${magicLink}" 
               style="
                 display:inline-block;
                 padding:12px 24px;
                 background-color:#155dfc;
                 color:#ffffff;
                 text-decoration:none;
                 border-radius:14px;
                 font-weight:600;
                 font-size:16px;
               ">
              Log in
            </a>
          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td style="border-top:1px solid #E5E7EB;padding-top:16px;"></td>
        </tr>

        <!-- Fallback text -->
        <tr>
          <td style="font-size:14px;color:#6a7282;padding-top:16px;">
            If the button doesn’t work, copy and paste this link into your browser:
          </td>
        </tr>

        <!-- Raw link -->
        <tr>
          <td style="
            margin-top:8px;
            word-break:break-all;
            font-size:14px;
            color:#155dfc;
            padding-top:8px;
          ">
            ${magicLink}
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
`;

    await this.mailService.sendMail(email, 'Your Magic Login Link', html);

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
