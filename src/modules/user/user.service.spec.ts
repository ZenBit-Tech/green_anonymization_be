import { Test, TestingModule } from '@nestjs/testing';
import { QueryFailedError, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import User from '@common/db/entities/user.entity';
import isMySqlError from '@common/utils/isMySqlError';
import UserService from './user.service';
import CreateAccountDto from './dto/createAccount.dto';

jest.mock('@common/utils/isMySqlError');

describe('UserService', () => {
  let service: UserService;
  let repo: Repository<User>;

  const mockUser: User = {
    uuid: '1234',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    companyName: 'Acme Corp',
  };

  const mockRepository = {
    find: jest.fn().mockResolvedValue([mockUser]),
    findOne: jest.fn().mockResolvedValue(mockUser),
    findOneBy: jest.fn().mockResolvedValue(mockUser),
    createQueryBuilder: jest.fn(() => ({
      insert: jest.fn().mockReturnThis(),
      into: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      execute: jest
        .fn()
        .mockResolvedValue({ identifiers: [{ uuid: mockUser.uuid }] }),
    })),
    save: jest.fn().mockResolvedValue(mockUser),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = await service.findAll();
      expect(users).toEqual([mockUser]);
      expect(repo.find).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on error', async () => {
      (repo.find as jest.Mock).mockRejectedValueOnce(new Error());
      await expect(service.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a user by uuid', async () => {
      const user = await service.findOne('1234');
      expect(user).toEqual(mockUser);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { uuid: '1234' } });
    });

    it('should throw NotFoundException if user not found', async () => {
      (repo.findOne as jest.Mock).mockResolvedValueOnce(null);
      await expect(service.findOne('not-found')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      (repo.findOne as jest.Mock).mockRejectedValueOnce(new Error());
      await expect(service.findOne('1234')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      const user = await service.findByEmail('test@example.com');
      expect(user).toEqual(mockUser);
      expect(repo.findOneBy).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
    });

    it('should return null if user not found', async () => {
      (repo.findOneBy as jest.Mock).mockResolvedValueOnce(null);
      const user = await service.findByEmail('missing@example.com');
      expect(user).toBeNull();
    });

    it('should throw InternalServerErrorException on error', async () => {
      (repo.findOneBy as jest.Mock).mockRejectedValueOnce(new Error());
      await expect(service.findByEmail('fail@example.com')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('create', () => {
    it('should create and return user', async () => {
      const user = await service.create('new@example.com');
      expect(user).toEqual(mockUser);
    });

    it('should throw ConflictException on duplicate email', async () => {
      // Mock isMySqlError to return true
      (
        isMySqlError as jest.MockedFunction<typeof isMySqlError>
      ).mockReturnValue(true);

      // Create a proper QueryFailedError instance with a code
      const error = new QueryFailedError(
        'mock query',
        [],
        new Error('duplicate entry'),
      ) as QueryFailedError & { code: string };
      error.code = 'ER_DUP_ENTRY';

      // Mock createQueryBuilder to throw that error
      (repo.createQueryBuilder as jest.Mock).mockImplementationOnce(() => {
        throw error;
      });

      await expect(service.create('duplicate@example.com')).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      // Mock isMySqlError to return false
      (
        isMySqlError as jest.MockedFunction<typeof isMySqlError>
      ).mockReturnValue(false);

      const error = new Error('DB error');
      (repo.createQueryBuilder as jest.Mock).mockImplementationOnce(() => {
        throw error;
      });

      await expect(service.create('fail@example.com')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('completeRegistration', () => {
    it('should throw BadRequestException if email missing', async () => {
      const dto: CreateAccountDto = {
        email: '',
        firstName: 'John',
        lastName: 'Doe',
        companyName: 'Acme',
      };
      await expect(service.completeRegistration(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create user if not exists and update details', async () => {
      (service.findByEmail as jest.Mock) = jest
        .fn()
        .mockResolvedValueOnce(null);
      (service.create as jest.Mock) = jest.fn().mockResolvedValueOnce(mockUser);

      const dto: CreateAccountDto = {
        email: 'new@example.com',
        firstName: 'John',
        lastName: 'Doe',
        companyName: 'Acme',
      };

      const result = await service.completeRegistration(dto);
      expect(result).toEqual(mockUser);
      expect(repo.save).toHaveBeenCalledWith(mockUser);
    });

    it('should update existing user details', async () => {
      (service.findByEmail as jest.Mock) = jest
        .fn()
        .mockResolvedValueOnce(mockUser);

      const dto: CreateAccountDto = {
        email: 'test@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        companyName: 'Acme',
      };

      const result = await service.completeRegistration(dto);
      expect(result).toEqual(mockUser);
      expect(repo.save).toHaveBeenCalledWith(mockUser);
    });

    it('should throw InternalServerErrorException if save fails', async () => {
      (repo.save as jest.Mock).mockRejectedValueOnce(new Error());
      const dto: CreateAccountDto = {
        email: 'test@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        companyName: 'Acme',
      };
      await expect(service.completeRegistration(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
