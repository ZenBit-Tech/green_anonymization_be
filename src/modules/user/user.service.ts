import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from '@common/db/entities/user.entity';
import S3Service from '@common/services/s3.service';
import CreateAccountDto from './dto/createAccount.dto';
import UpdateWorkflowTourDto from './dto/updateWorkflowTour.dto';
import UpdateProfileDto from './dto/updateProfile.dto';
import ReturnUserDto from './dto/returnUser.dto';
import AvatarResponseDto from './dto/avatarResponse.dto';

@Injectable()
export default class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly s3: S3Service,
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

  async uploadAvatar(
    email: string,
    file: Express.Multer.File,
  ): Promise<AvatarResponseDto> {
    this.logger.log(
      `uploadAvatar: email=${email}, originalname=${file?.originalname}, mimetype=${file?.mimetype}, size=${file?.size}`,
    );

    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      const ext = file.originalname.split('.').pop();
      const key = `avatars/${user.uuid}.${ext}`;
      const uploadedUrl = await this.s3.uploadImage(
        key,
        file.buffer,
        file.mimetype,
      );
      const avatarUrl = `${uploadedUrl}?v=${Date.now()}`;

      user.avatarUrl = avatarUrl;
      await this.userRepository.save(user);

      this.logger.log(`uploadAvatar success: ${avatarUrl}`);
      return { avatarUrl };
    } catch (err) {
      this.logger.error(
        `uploadAvatar failed: ${(err as Error).message}`,
        (err as Error).stack,
      );
      throw err;
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

  async updateProfile(
    email: string,
    dto: UpdateProfileDto,
  ): Promise<ReturnUserDto> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;
    if (dto.companyName !== undefined) user.companyName = dto.companyName;

    try {
      return await this.userRepository.save(user);
    } catch (err) {
      this.logger.error(
        `updateProfile failed: ${(err as Error).message}`,
        (err as Error).stack,
      );
      throw new InternalServerErrorException('Failed to update profile');
    }
  }

  async updateWorkflowTour(
    email: string,
    dto: UpdateWorkflowTourDto,
  ): Promise<ReturnUserDto> {
    const user: User | null = await this.findByEmail(email);

    if (!user) {
      throw new NotFoundException('Specified user not found');
    }

    try {
      user.workflowTour = {
        skipped: false,
        dashboard: false,
        deidentification: false,
        results: false,
        synthetic: false,
        ...(user.workflowTour ?? {}),
        ...dto,
      };

      return await this.userRepository.save(user);
    } catch {
      throw new InternalServerErrorException('Failed to update workflow tour');
    }
  }
}
