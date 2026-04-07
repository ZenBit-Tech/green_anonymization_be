import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
// import ExampleUser from '@common/db/entities/example.user.entity';
import ExampleUser from '@common/db/entities/example.user.entity';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import ExampleUser from '@/common/db/entities/example.user.entity';
import ExampleUserService from './example.user.service';

describe('ExampleUserService', () => {
  let service: ExampleUserService;
  let repo: Repository<ExampleUser>;

  const mockUser: ExampleUser = { uuid: '1234', email: 'test@example.com' };

  const mockRepository = {
    createQueryBuilder: jest.fn(() => ({
      getMany: jest.fn().mockResolvedValue([mockUser]),
      getOne: jest.fn().mockResolvedValue(mockUser),
      insert: jest.fn().mockReturnThis(),
      into: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      execute: jest
        .fn()
        .mockResolvedValue({ identifiers: [{ uuid: mockUser.uuid }] }),
      where: jest.fn().mockReturnThis(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExampleUserService,
        { provide: getRepositoryToken(ExampleUser), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ExampleUserService>(ExampleUserService);
    repo = module.get<Repository<ExampleUser>>(getRepositoryToken(ExampleUser));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = await service.findAll();
      expect(users).toEqual([mockUser]);
      expect(repo.createQueryBuilder).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on error', async () => {
      (repo.createQueryBuilder as jest.Mock).mockImplementationOnce(() => {
        throw new Error();
      });
      await expect(service.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a user by uuid', async () => {
      const user = await service.findOne('1234');
      expect(user).toEqual(mockUser);
      expect(repo.createQueryBuilder).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      (repo.createQueryBuilder as jest.Mock).mockReturnValueOnce({
        getOne: jest.fn().mockResolvedValue(null),
        where: jest.fn().mockReturnThis(),
      });

      await expect(service.findOne('not-found')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      (repo.createQueryBuilder as jest.Mock).mockImplementationOnce(() => {
        throw new Error();
      });
      await expect(service.findOne('1234')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('createUser', () => {
    it('should create and return a user', async () => {
      const user = await service.create('test@example.com');
      expect(user).toEqual(mockUser);
    });

    it('should throw InternalServerErrorException if insert fails', async () => {
      (repo.createQueryBuilder as jest.Mock).mockReturnValueOnce({
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ identifiers: [] }),
      });

      await expect(service.create('fail@example.com')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
