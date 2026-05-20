import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from '@common/db/entities/user.entity';
import CreateAccountDto from './dto/createAccount.dto';
import UpdateWorkflowTourDto from './dto/updateWorkflowTour.dto';
import ReturnUserDto from './dto/returnUser.dto';

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

  async register(dto: CreateAccountDto, email: string): Promise<User> {
    if (!email) {
      throw new BadRequestException('Email is Required but was not provided');
    }

    let user: User | null = null;

    try {
      await this.userRepository.manager.transaction(
        async (transactionalEntityManager) => {
          user = await transactionalEntityManager
            .createQueryBuilder(User, 'user')
            .where('user.email = :email', { email })
            .getOne();

          if (user) {
            throw new BadRequestException('User already exists');
          }

          if (!user) {
            const insertResult = await transactionalEntityManager
              .createQueryBuilder()
              .insert()
              .into(User)
              .values({ email })
              .orIgnore()
              .execute();

            const insertedUuid = insertResult.identifiers[0]?.uuid;
            if (!insertedUuid) {
              throw new InternalServerErrorException(
                'Failed to create a new User',
              );
            }

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

      const updatedUser = await this.findByEmail(email);
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

  async checkDefaultFramework(email: string): Promise<string | null> {
    const user: User | null = await this.findByEmail(email);
    if (!user) {
      throw new BadRequestException('No user with specified email');
    }
    if (user.defaultFramework) {
      return user.defaultFramework;
    }
    return null;
  }

  async setDefaultFramework(
    email: string,
    frameworkCode: string,
  ): Promise<string> {
    try {
      const user: User | null = await this.findByEmail(email);
      if (!user) {
        throw new BadRequestException('Specified user not found');
      }
      user.defaultFramework = frameworkCode;

      await this.userRepository.save(user);
      return user.uuid;
    } catch (err) {
      throw new InternalServerErrorException('Failed to set default framework');
    }
  }

  async updateWorkflowTour(
    email: string,
    dto: UpdateWorkflowTourDto,
  ): Promise<ReturnUserDto> {
    const user: User | null = await this.findByEmail(email);

    if (!user) {
      throw new BadRequestException('Specified user not found');
    }

    try {
      user.workflowTour = {
        skipped: false,
        dashboard: false,
        deidentification: false,
        results: false,
        synthetic: false,
        ...user.workflowTour,
        ...dto,
      };

      return await this.userRepository.save(user);
    } catch {
      throw new InternalServerErrorException('Failed to update workflow tour');
    }
  }
}
