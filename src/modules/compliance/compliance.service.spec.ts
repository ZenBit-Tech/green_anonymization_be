import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

import User from '@common/db/entities/user.entity';
import UserService from '@modules/user/user.service';
import ComplianceService from './compliance.service';

describe('ComplianceService', () => {
  let service: ComplianceService;

  const mockUserRepository = {
    save: jest.fn(),
  };

  const mockUserService = {
    findByEmail: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplianceService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<ComplianceService>(ComplianceService);
  });

  it('should throw NotFoundException if framework does not exist', async () => {
    await expect(
      service.selectFrameworkByEmail('test@example.com', 'UNKNOWN'),
    ).rejects.toThrow(NotFoundException);

    expect(mockUserService.findByEmail).not.toHaveBeenCalled();
  });
});
