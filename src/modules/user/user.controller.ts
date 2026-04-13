import {
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Body,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import JwtAuthGuard from '@modules/auth/guards/jwt-auth.guard';
import { UserRegistrationStatus } from '@common/constants';
import RegistrationGuard from '@/modules/auth/guards/registeration.guard';
import UserEmail from '@/common/utils/decorators/user-email.decorator';
import User from '@/common/db/entities/user.entity';
import UserService from './user.service';
import CreateAccountDto from './dto/createAccount.dto';
import ReturnUserDto from './dto/returnUser.dto';

@ApiTags('user')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('user')
export default class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Complete user registration' })
  @ApiCreatedResponse({
    description: 'User successfully registered',
    type: User,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized (invalid or missing JWT)',
  })
  @ApiForbiddenResponse({
    description: 'User is already registered',
  })
  @Post('register')
  @UseGuards(
    JwtAuthGuard,
    new RegistrationGuard(UserRegistrationStatus.UNREGISTERED),
  )
  async register(
    @UserEmail() email: string,
    @Body() dto: CreateAccountDto,
  ): Promise<ReturnUserDto> {
    return this.userService.register(dto, email);
  }

  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiOkResponse({
    description: 'User retrieved successfully',
    type: User,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized (invalid or missing JWT)',
  })
  @ApiForbiddenResponse({
    description: 'User is not fully registered',
  })
  @Get('me')
  @UseGuards(
    JwtAuthGuard,
    new RegistrationGuard(UserRegistrationStatus.REGISTERED),
  )
  async getMe(
    @Req() req: Request & { user: { email: string } },
  ): Promise<ReturnUserDto | null> {
    return this.userService.findByEmail(req.user.email);
  }
}
