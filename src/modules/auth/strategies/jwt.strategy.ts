import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import UserService from '@modules/user/user.service';
import { JwtTokenType } from '@/common/constants';

@Injectable()
export default class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { email?: string; type?: string }) {
    if (!payload?.email || payload.type !== JwtTokenType.ACCESS) {
      throw new UnauthorizedException('Invalid access token');
    }

    const user = await this.userService.findByEmail(payload.email);

    if (!user) {
      return {
        email: payload.email,
        isRegistered: false,
      };
    }

    return {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      companyName: user.companyName,
      isRegistered: true,
    };
  }
}
