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
import RegistrationGuard from '@/modules/auth/guards/registeration.guard';
import UserEmail from '@/common/utils/decorators/user-email.decorator';
import User from '@/common/db/entities/user.entity';
import UserService from './user.service';
import CreateAccountDto from './dto/createAccount.dto';

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
  @UseGuards(JwtAuthGuard, new RegistrationGuard('unregistered'))
  async register(
    @UserEmail() email: string,
    @Body() dto: CreateAccountDto,
  ): Promise<User> {
    return this.userService.register({ ...dto, email });
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
  @UseGuards(JwtAuthGuard, new RegistrationGuard('registered'))
  async getMe(
    @Req() req: Request & { user: { email: string } },
  ): Promise<User | null> {
    return this.userService.findByEmail(req.user.email);
  }
}
