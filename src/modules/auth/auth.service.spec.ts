import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import UserService from '@modules/user/user.service';
import MailService from '@modules/mail/mail.service';
import {
  ACCESS_TOKEN_EXPIRATION,
  MAGIC_LINK_EXPIRATION,
  JwtTokenType,
} from '@common/constants';
import AuthService from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let mailService: MailService;
  let userService: UserService;

  const mockUser = { email: 'test@example.com' };

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
            findByEmail: jest.fn().mockResolvedValue(mockUser),
          },
        },
        {
          provide: MailService,
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
    jwtService = module.get<JwtService>(JwtService);
    mailService = module.get<MailService>(MailService);
    userService = module.get<UserService>(UserService);
  });

  describe('generateMagicToken', () => {
    it('should generate token and send email with magic link', async () => {
      const token = await service.generateMagicToken('test@example.com');

      expect(token).toBe('signed-token');

      expect(jwtService.sign).toHaveBeenCalledWith(
        { email: 'test@example.com', type: JwtTokenType.MAGIC },
        { expiresIn: MAGIC_LINK_EXPIRATION },
      );

      expect(mailService.sendMail).toHaveBeenCalledWith(
        'test@example.com',
        'Your Magic Login Link',
        expect.stringContaining(
          'http://localhost:3000/auth-callback?token=signed-token',
        ),
      );
    });
  });

  describe('generateAuthTokens', () => {
    it('should generate access and refresh tokens and detect registered user', async () => {
      const tokens = await service.generateAuthTokens('test@example.com');
      expect(jwtService.sign).toHaveBeenCalledTimes(2);

      expect(userService.findByEmail).toHaveBeenCalledWith('test@example.com');

      expect(tokens).toEqual({
        accessToken: 'signed-token',
        refreshToken: 'signed-token',
        isRegistered: true,
      });
    });

    it('should return isRegistered false when user does not exist', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValueOnce(null);

      const tokens = await service.generateAuthTokens('test@example.com');

      expect(tokens.isRegistered).toBe(false);
    });
  });

  describe('refreshAccessToken', () => {
    it('should return new access token for valid refresh token', async () => {
      (jwtService.verify as jest.Mock).mockReturnValue({
        email: 'test@example.com',
        type: JwtTokenType.REFRESH,
      });

      const result = await service.refreshAccessToken('refresh-token');

      expect(jwtService.verify).toHaveBeenCalledWith('refresh-token');

      expect(jwtService.sign).toHaveBeenCalledWith(
        { email: 'test@example.com', type: JwtTokenType.ACCESS },
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

    it('should throw UnauthorizedException for verification failure', async () => {
      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error();
      });

      await expect(service.refreshAccessToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
