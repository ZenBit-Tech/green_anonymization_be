import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from '@common/db/entities/user.entity';
import isMySqlError from '@common/utils/isMySqlError';
import CreateAccountDto from './dto/createAccount.dto';

@Injectable()
export default class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    try {
      return await this.userRepository.find();
    } catch {
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async findOne(uuid: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { uuid } });

      if (!user)
        throw new NotFoundException(`User with uuid ${uuid} not found`);
      return user;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;

      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findOneBy({ email });
      return user ?? null;
    } catch (err) {
      throw new InternalServerErrorException(
        `Failed to fetch user, error: ${err}`,
      );
    }
  }

  async create(email: string): Promise<User | null> {
    try {
      const result = await this.userRepository
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({ email })
        .execute();

      // return the inserted user
      const insertedId = result.identifiers[0].uuid;
      return await this.userRepository.findOne({ where: { uuid: insertedId } });
    } catch (error: unknown) {
      // check for duplicate key error
      if (isMySqlError(error) && error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Email already exists');
      }
      throw new InternalServerErrorException(
        `Failed to create user, error: ${error}`,
      );
    }
  }

  //   async completeRegistration(dto: CreateAccountDto): Promise<User> {
  //     if (!dto.email) throw new BadRequestException('Email is required');

  //     let user = await this.findByEmail(dto.email);

  //     if (!user) {
  //       user = await this.create(dto.email);
  //       if (!user) {
  //         throw new InternalServerErrorException('Failed to create user');
  //       }
  //     }

  //     // Update registration details
  //     user.firstName = dto.firstName;
  //     user.lastName = dto.lastName;
  //     user.companyName = dto.companyName;

  //     try {
  //       return await this.userRepository.save(user);
  //     } catch (err) {
  //       throw new InternalServerErrorException(
  //         `Failed to update user, error: ${err}`,
  //       );
  //     }
  //   }

  async completeRegistration(dto: CreateAccountDto): Promise<User> {
    if (!dto.email) {
      throw new BadRequestException('Email is Required but was not provided');
    }

    let user: User | null = null;

    try {
      // Execute everything in a transaction
      await this.userRepository.manager.transaction(
        async (transactionalEntityManager) => {
          // Step 1: Check if user exists
          user = await transactionalEntityManager
            .createQueryBuilder(User, 'user')
            .where('user.email = :email', { email: dto.email })
            .getOne();

          // Step 2: Create user if it doesn't exist
          if (!user) {
            const insertResult = await transactionalEntityManager
              .createQueryBuilder()
              .insert()
              .into(User)
              .values({ email: dto.email })
              .execute();

            const insertedUuid = insertResult.identifiers[0]?.uuid;
            if (!insertedUuid) {
              throw new InternalServerErrorException(
                'Failed to create a new User',
              );
            }

            // Fetch newly created user
            user = await transactionalEntityManager
              .createQueryBuilder(User, 'user')
              .where('user.uuid = :uuid', { uuid: insertedUuid })
              .getOne();
          }

          if (!user) {
            throw new InternalServerErrorException(
              'Failed to fetch newly created users',
            );
          }

          // Step 3: Update registration details
          await transactionalEntityManager
            .createQueryBuilder()
            .update(User)
            .set({
              firstName: dto.firstName,
              lastName: dto.lastName,
              companyName: dto.companyName,
            })
            .where('uuid = :uuid', { uuid: user.uuid })
            .execute();
        },
      );

      // Step 4: Return updated user
      const updatedUser = await this.findByEmail(dto.email);
      if (!updatedUser) {
        throw new InternalServerErrorException('Failed to fetch updated User');
      }
      return updatedUser;
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException(
        `${'Failed to complete registration'}: ${err}`,
      );
    }
  }
}
