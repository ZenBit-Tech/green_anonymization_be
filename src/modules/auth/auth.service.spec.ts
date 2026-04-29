import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

import UserService from '@modules/user/user.service';
import EmailService from '@modules/email/email.service';

import {
  ACCESS_TOKEN_EXPIRATION,
  MAGIC_LINK_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION,
  JwtTokenType,
} from '@common/constants';

import AuthService from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: jest.Mocked<JwtService>;
  let mailService: jest.Mocked<EmailService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('signed-token'),
            verify: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendMail: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('http://localhost:3000'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get(JwtService);
    mailService = module.get(EmailService);

    jest.clearAllMocks();
  });

  describe('generateMagicToken', () => {
    it('should generate token and send email with magic link', async () => {
      const email = 'test@example.com';

      const token = await service.generateMagicToken(email);

      expect(token).toBe('signed-token');

      expect(jwtService.sign).toHaveBeenCalledWith(
        { email, type: JwtTokenType.MAGIC },
        { expiresIn: MAGIC_LINK_EXPIRATION },
      );

      expect(mailService.sendMail).toHaveBeenCalledWith(
        email,
        'Your Magic Login Link',
        expect.stringContaining(
          'http://localhost:3000/auth-callback?token=signed-token',
        ),
      );
    });
  });

  describe('generateAuthTokens', () => {
    it('should generate access and refresh tokens', async () => {
      const email = 'test@example.com';

      const result = await service.generateAuthTokens(email);

      expect(jwtService.sign).toHaveBeenNthCalledWith(
        1,
        { email, type: JwtTokenType.ACCESS },
        { expiresIn: ACCESS_TOKEN_EXPIRATION },
      );

      expect(jwtService.sign).toHaveBeenNthCalledWith(
        2,
        { email, type: JwtTokenType.REFRESH },
        { expiresIn: REFRESH_TOKEN_EXPIRATION },
      );

      expect(result).toEqual({
        accessToken: 'signed-token',
        refreshToken: 'signed-token',
      });
    });
  });

  describe('refreshAccessToken', () => {
    it('should return new access token for valid refresh token', async () => {
      const payload = {
        email: 'test@example.com',
        type: JwtTokenType.REFRESH,
      };

      (jwtService.verify as jest.Mock).mockReturnValue(payload);

      const result = await service.refreshAccessToken('refresh-token');

      expect(jwtService.verify).toHaveBeenCalledWith('refresh-token');

      expect(jwtService.sign).toHaveBeenCalledWith(
        { email: payload.email, type: JwtTokenType.ACCESS },
        { expiresIn: ACCESS_TOKEN_EXPIRATION },
      );

      expect(result).toBe('signed-token');
    });

    it('should throw UnauthorizedException for invalid token type', async () => {
      (jwtService.verify as jest.Mock).mockReturnValue({
        email: 'test@example.com',
        type: JwtTokenType.ACCESS,
      });

      await expect(service.refreshAccessToken('refresh-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when verification fails', async () => {
      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('invalid');
      });

      await expect(service.refreshAccessToken('bad-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
