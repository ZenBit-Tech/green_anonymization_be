import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import UserService from '@modules/user/user.service';
import MailService from '@modules/mail/mail.service';
import {
  ACCESS_TOKEN_EXPIRATION,
  MAGIC_LINK_EXPIRATION,
} from '@common/constants';
import AuthService from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let mailService: MailService;

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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateMagicToken', () => {
    it('should generate token and send email', async () => {
      const token = await service.generateMagicToken('test@example.com');
      expect(token).toBe('signed-token');
      expect(jwtService.sign).toHaveBeenCalledWith(
        { email: 'test@example.com', type: 'magic' },
        { expiresIn: MAGIC_LINK_EXPIRATION },
      );
      expect(mailService.sendMail).toHaveBeenCalled();
    });
  });

  describe('generateAuthTokens', () => {
    it('should generate access and refresh tokens', async () => {
      const tokens = await service.generateAuthTokens('test@example.com');
      expect(tokens.accessToken).toBe('signed-token');
      expect(tokens.refreshToken).toBe('signed-token');
      expect(tokens.isRegistered).toBe(true);
    });
  });

  describe('refreshTokens', () => {
    it('should return new access token for valid refresh token', async () => {
      (jwtService.verify as jest.Mock).mockReturnValue({
        email: 'test@example.com',
        type: 'refresh',
      });
      const result = await service.refreshTokens('refresh-token');
      expect(result.accessToken).toBe('signed-token');
      expect(jwtService.sign).toHaveBeenCalledWith(
        { email: 'test@example.com', type: 'access' },
        { expiresIn: ACCESS_TOKEN_EXPIRATION },
      );
    });

    it('should throw UnauthorizedException for invalid token type', async () => {
      (jwtService.verify as jest.Mock).mockReturnValue({
        email: 'test@example.com',
        type: 'access',
      });
      await expect(service.refreshTokens('refresh-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for verification failure', async () => {
      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error();
      });
      await expect(service.refreshTokens('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
