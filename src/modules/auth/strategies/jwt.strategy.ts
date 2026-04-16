import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtTokenType } from '@common/constants';

@Injectable()
export default class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async validate(payload: {
    email?: string;
    type?: string;
  }): Promise<{ email: string }> {
    if (!payload?.email || payload.type !== JwtTokenType.ACCESS) {
      throw new UnauthorizedException('Invalid access token');
    }
    return {
      email: payload.email,
    };
  }
}
