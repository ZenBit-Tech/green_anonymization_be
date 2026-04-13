import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import type { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import UserService from '@modules/user/user.service';
import { JwtTokenType } from '@common/constants';

type MagicValidationResult = {
  email: string;
  isRegistered: boolean;
};

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

  async validate(req: Request): Promise<MagicValidationResult> {
    const { token } = req.query as Record<string, string>;
    if (!token) throw new UnauthorizedException('Token missing');

    let payload: { email: string; type: string };

    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
    if (payload.type !== JwtTokenType.MAGIC)
      throw new UnauthorizedException('Invalid token type');

    const user = await this.userService.findByEmail(payload.email);

    return {
      email: payload.email,
      isRegistered: !!user,
    };
  }
}
