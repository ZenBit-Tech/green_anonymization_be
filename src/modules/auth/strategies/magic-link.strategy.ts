import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import type { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { JwtTokenType } from '@common/constants';

@Injectable()
export default class MagicLoginStrategy extends PassportStrategy(
  Strategy,
  'magic',
) {
  constructor(private jwtService: JwtService) {
    super();
  }

  async validate(req: Request): Promise<{
    email: string;
  }> {
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

    return {
      email: payload.email,
    };
  }
}
