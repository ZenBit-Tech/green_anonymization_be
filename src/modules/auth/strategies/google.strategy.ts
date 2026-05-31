import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';

import { AuthProviders } from '@common/constants';
import { OAuthUser } from '../types';

@Injectable()
export default class GoogleStrategy extends PassportStrategy(
  Strategy,
  'google',
) {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),

      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),

      callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),

      scope: ['profile', 'email'],
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<OAuthUser> {
    const { id, emails, photos, name } = profile;

    const email = emails?.[0]?.value;

    if (!email) {
      throw new UnauthorizedException('Google account has no email');
    }

    return {
      provider: AuthProviders.GOOGLE,
      providerId: id,
      email,
      firstName: name?.givenName ?? '',
      lastName: name?.familyName ?? '',
      picture: photos?.[0]?.value,
    };
  }
}
