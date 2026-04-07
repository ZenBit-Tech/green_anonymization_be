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
    } catch (err) {
      // check for duplicate key error
      if (err?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Email already exists');
      }
      throw new InternalServerErrorException(
        `Failed to create user, error: ${err}`,
      );
    }
  }

  async completeRegistration(dto: CreateAccountDto): Promise<User> {
    if (!dto.email) throw new BadRequestException('Email is required');

    let user = await this.findByEmail(dto.email);

    if (!user) {
      user = await this.create(dto.email);
      if (!user) {
        throw new InternalServerErrorException('Failed to create user');
      }
    }

    // Update registration details
    user.firstName = dto.firstName;
    user.lastName = dto.lastName;
    user.companyName = dto.companyName;

    try {
      return await this.userRepository.save(user);
    } catch (err) {
      throw new InternalServerErrorException(
        `Failed to update user, error: ${err}`,
      );
    }
  }
}
