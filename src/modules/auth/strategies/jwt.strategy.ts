import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import UserService from '@modules/user/user.service';

@Injectable()
export default class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.accessToken,
      ]),
      ignoreExpiration: false,
      secretOrKey: new ConfigService().getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { email?: string }) {
    if (!payload?.email) {
      throw new UnauthorizedException('Invalid token');
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
