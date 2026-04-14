/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import ContactMessage from '@entities/contactMessage.entity';
import EmailService from './email.service';

describe('EmailService', () => {
  let service: EmailService;
  let mockRepository: { manager: { transaction: jest.Mock } };
  let mockDataSource: { transaction: jest.Mock };

  const mockContactMessageInput = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phoneNumber: '+380123456789',
    message: 'Test message',
  };

  const mockContactMessage = {
    uuid: '550e8400-e29b-41d4-a716-446655440000',
    ...mockContactMessageInput,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    mockDataSource = {
      transaction: jest.fn(),
    };

    mockRepository = {
      manager: mockDataSource,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: getRepositoryToken(ContactMessage),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  describe('createContactMessage', () => {
    it('should successfully create contact message with valid input', async () => {
      const mockQueryBuilder = {
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          identifiers: [{ uuid: mockContactMessage.uuid }],
        }),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockContactMessage),
      };

      mockDataSource.transaction.mockImplementation(
        async (
          callback: (tm: { getRepository: jest.Mock }) => Promise<unknown>,
        ) => {
          const mockRepo = {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          };
          return callback({
            getRepository: jest.fn().mockReturnValue(mockRepo),
          });
        },
      );

      const result = await service.createContactMessage(
        mockContactMessageInput,
      );

      expect(result).toEqual({
        message: 'Email submission created successfully',
      });
    });

    it('should sanitize HTML and JavaScript from input', async () => {
      const maliciousInput = {
        firstName: '<script>alert("xss")</script>John',
        lastName: '<img src=x onerror="alert(1)">Doe',
        email: 'john@example.com',
        phoneNumber: '+380123456789',
        message: '<b>Bold</b> message with <script>code</script>',
      };

      const capturedValues: { data?: Record<string, unknown>[] } = {};

      const mockQueryBuilder = {
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest
          .fn()
          .mockImplementation((values: Record<string, unknown>[]) => {
            capturedValues.data = values;
            return mockQueryBuilder;
          }),
        execute: jest.fn().mockResolvedValue({
          identifiers: [{ uuid: mockContactMessage.uuid }],
        }),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockContactMessage),
      };

      mockDataSource.transaction.mockImplementation(
        async (
          callback: (tm: { getRepository: jest.Mock }) => Promise<unknown>,
        ) => {
          const mockRepo = {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          };
          return callback({
            getRepository: jest.fn().mockReturnValue(mockRepo),
          });
        },
      );

      await service.createContactMessage(maliciousInput);

      const insertedValues = capturedValues.data![0];
      expect(insertedValues.firstName).not.toContain('<script>');
      expect(insertedValues.firstName).not.toContain('alert');
      expect(insertedValues.message).not.toContain('<script>');
      expect(insertedValues.message).not.toContain('<b>');
    });

    it('should throw error when insert does not return UUID', async () => {
      const mockQueryBuilder = {
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          identifiers: [{}],
        }),
      };

      mockDataSource.transaction.mockImplementation(
        async (
          callback: (tm: { getRepository: jest.Mock }) => Promise<unknown>,
        ) => {
          const mockRepo = {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          };
          return callback({
            getRepository: jest.fn().mockReturnValue(mockRepo),
          });
        },
      );

      await expect(
        service.createContactMessage(mockContactMessageInput),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw error when created record cannot be fetched', async () => {
      const mockQueryBuilder = {
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          identifiers: [{ uuid: mockContactMessage.uuid }],
        }),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      mockDataSource.transaction.mockImplementation(
        async (
          callback: (tm: { getRepository: jest.Mock }) => Promise<unknown>,
        ) => {
          const mockRepo = {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          };
          return callback({
            getRepository: jest.fn().mockReturnValue(mockRepo),
          });
        },
      );

      await expect(
        service.createContactMessage(mockContactMessageInput),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should rollback transaction on error', async () => {
      mockDataSource.transaction.mockRejectedValue(new Error('Database error'));

      await expect(
        service.createContactMessage(mockContactMessageInput),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('sanitizeInput (private method via integration)', () => {
    it('should remove HTML tags from input', async () => {
      const inputWithHTML = {
        firstName: '<span>John</span>',
        lastName: 'Doe',
        email: 'john@example.com',
        phoneNumber: '+380123456789',
        message: '<p>Test</p>',
      };

      const capturedValues: { data?: Record<string, unknown>[] } = {};

      const mockQueryBuilder = {
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest
          .fn()
          .mockImplementation((values: Record<string, unknown>[]) => {
            capturedValues.data = values;
            return mockQueryBuilder;
          }),
        execute: jest.fn().mockResolvedValue({
          identifiers: [{ uuid: mockContactMessage.uuid }],
        }),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockContactMessage),
      };

      mockDataSource.transaction.mockImplementation(
        async (
          callback: (tm: { getRepository: jest.Mock }) => Promise<unknown>,
        ) => {
          const mockRepo = {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          };
          return callback({
            getRepository: jest.fn().mockReturnValue(mockRepo),
          });
        },
      );

      await service.createContactMessage(inputWithHTML);

      const insertedValues = capturedValues.data![0];
      expect(insertedValues.firstName).toBe('John');
      expect(insertedValues.message).toBe('Test');
    });

    it('should trim whitespace from input', async () => {
      const inputWithSpaces = {
        firstName: '  John  ',
        lastName: '  Doe  ',
        email: 'john@example.com  ',
        phoneNumber: '+380123456789',
        message: '  Test message  ',
      };

      const capturedValues: { data?: Record<string, unknown>[] } = {};

      const mockQueryBuilder = {
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest
          .fn()
          .mockImplementation((values: Record<string, unknown>[]) => {
            capturedValues.data = values;
            return mockQueryBuilder;
          }),
        execute: jest.fn().mockResolvedValue({
          identifiers: [{ uuid: mockContactMessage.uuid }],
        }),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockContactMessage),
      };

      mockDataSource.transaction.mockImplementation(
        async (
          callback: (tm: { getRepository: jest.Mock }) => Promise<unknown>,
        ) => {
          const mockRepo = {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          };
          return callback({
            getRepository: jest.fn().mockReturnValue(mockRepo),
          });
        },
      );

      await service.createContactMessage(inputWithSpaces);

      const insertedValues = capturedValues.data![0];
      expect(insertedValues.firstName).toBe('John');
      expect(insertedValues.message).toBe('Test message');
    });
  });
});
