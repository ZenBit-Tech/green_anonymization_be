import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';

import { AuthProviders } from '@common/constants';
import { OAuthUser } from '../types';

@Injectable()
export default class MicrosoftStrategy extends PassportStrategy(
  Strategy,
  'microsoft',
) {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('MICROSOFT_CLIENT_ID'),

      clientSecret: configService.getOrThrow<string>('MICROSOFT_CLIENT_SECRET'),

      callbackURL: configService.getOrThrow<string>('MICROSOFT_CALLBACK_URL'),

      scope: ['user.read'],

      tenant: configService.get<string>('MICROSOFT_TENANT_ID') ?? 'common',
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async validate(
    accessToken: string,
    refreshToken: string,
    profile,
  ): Promise<OAuthUser> {
    const email =
      profile.emails?.[0]?.value ??
      // eslint-disable-next-line no-underscore-dangle
      profile._json?.mail ??
      // eslint-disable-next-line no-underscore-dangle
      profile._json?.userPrincipalName;

    if (!email) {
      throw new UnauthorizedException('Microsoft account has no email');
    }

    return {
      provider: AuthProviders.MICROSOFT,
      providerId: profile.id,
      email,
      firstName: profile.name?.givenName ?? '',
      lastName: profile.name?.familyName ?? '',
      picture: profile.photos?.[0]?.value,
    };
  }
}
