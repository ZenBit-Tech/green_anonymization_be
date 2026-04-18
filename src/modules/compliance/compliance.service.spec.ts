import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

import ComplianceSelection from '@common/db/entities/compliance-selection.entity';

import UserService from '@modules/user/user.service';
import ComplianceService from './compliance.service';

describe('ComplianceService', () => {
  let service: ComplianceService;

  const mockSelectionRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
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
          provide: getRepositoryToken(ComplianceSelection),
          useValue: mockSelectionRepo,
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
