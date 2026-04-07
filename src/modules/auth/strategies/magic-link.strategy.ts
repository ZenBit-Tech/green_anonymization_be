import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import type { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import UserService from '@modules/user/user.service';

@Injectable()
export default class MagicLoginStrategy extends PassportStrategy(
  Strategy,
  'magic',
) {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {
    super();
  }

  async validate(req: Request) {
    const { token } = req.query as Record<string, string>;
    if (!token) throw new UnauthorizedException('Token missing');

    const payload = this.jwtService.verify(token) as {
      email: string;
      type: string;
    };
    if (payload.type !== 'magic')
      throw new UnauthorizedException('Invalid token type');

    try {
      const user = await this.userService.findByEmail(payload.email);
      if (!user)
        throw new BadRequestException(
          "Didn't find user in magiclink strategy validate method",
        );
      return {
        email: user.email,
        isRegistered: true,
      };
    } catch {
      return {
        email: payload.email,
        isRegistered: false,
      };
    }
  }
}
