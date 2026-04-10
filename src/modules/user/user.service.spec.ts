import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import User from '@common/db/entities/user.entity';
import UserService from './user.service';
import CreateAccountDto from './dto/createAccount.dto';

describe('UserService', () => {
  let service: UserService;
  let repo: Repository<User>;

  const mockUser: User = {
    uuid: '1234',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    companyName: 'Acme',
  } as User;

  const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    manager: {
      transaction: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('returns all users', async () => {
      (repo.find as jest.Mock).mockResolvedValue([mockUser]);

      const result = await service.findAll();

      expect(result).toEqual([mockUser]);
    });

    it('throws InternalServerErrorException on failure', async () => {
      (repo.find as jest.Mock).mockRejectedValue(new Error());

      await expect(service.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('returns a user', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findOne(mockUser.uuid);

      expect(result).toEqual(mockUser);
    });

    it('throws NotFoundException if user missing', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws InternalServerErrorException on error', async () => {
      (repo.findOne as jest.Mock).mockRejectedValue(new Error());

      await expect(service.findOne('123')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findByEmail', () => {
    it('returns user if found', async () => {
      (repo.findOneBy as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findByEmail(mockUser.email);

      expect(result).toEqual(mockUser);
      expect(repo.findOneBy).toHaveBeenCalledWith({
        email: mockUser.email,
      });
    });

    it('returns null if not found', async () => {
      (repo.findOneBy as jest.Mock).mockResolvedValue(null);

      const result = await service.findByEmail('missing@email.com');

      expect(result).toBeNull();
    });

    it('throws InternalServerErrorException on failure', async () => {
      (repo.findOneBy as jest.Mock).mockRejectedValue(new Error());

      await expect(service.findByEmail('fail@email.com')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('register', () => {
    const dto: CreateAccountDto = {
      firstName: 'Jane',
      lastName: 'Smith',
      companyName: 'Acme',
    };

    const email = 'test@example.com';

    it('throws BadRequestException if email missing', async () => {
      await expect(service.register(dto, '' as string)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('completes registration successfully', async () => {
      (repo.manager.transaction as jest.Mock).mockImplementation(async (cb) => {
        await cb({
          createQueryBuilder: () => ({
            where: () => ({
              getOne: async () => mockUser,
            }),
            insert: () => ({
              into: () => ({
                values: () => ({
                  orIgnore: () => ({
                    execute: async () => ({
                      identifiers: [{ uuid: mockUser.uuid }],
                    }),
                  }),
                }),
              }),
            }),
            update: () => ({
              set: () => ({
                where: () => ({
                  execute: async () => ({}),
                }),
              }),
            }),
          }),
        });
      });

      jest.spyOn(service, 'findByEmail').mockResolvedValue(mockUser);

      const result = await service.register(dto, email);

      expect(result).toEqual(mockUser);
    });

    it('throws if updated user cannot be fetched', async () => {
      (repo.manager.transaction as jest.Mock).mockResolvedValue(undefined);

      jest.spyOn(service, 'findByEmail').mockResolvedValue(null);

      await expect(service.register(dto, email)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('throws if transaction fails', async () => {
      (repo.manager.transaction as jest.Mock).mockRejectedValue(
        new Error('db error'),
      );

      await expect(service.register(dto, email)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
