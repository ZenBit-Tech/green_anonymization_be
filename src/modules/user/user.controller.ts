import {
  Controller,
  Get,
  Post,
  Patch,
  Req,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Body,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBody,
} from '@nestjs/swagger';
import JwtAuthGuard from '@modules/auth/guards/jwt-auth.guard';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import UserEmail from '@common/utils/decorators/user-email.decorator';
import User from '@common/db/entities/user.entity';
import PricingService from '@modules/pricing/pricing.service';
import UserService from './user.service';
import CreateAccountDto from './dto/createAccount.dto';
import ReturnUserDto from './dto/returnUser.dto';
import SessionResponseDto from './dto/sessionResponse.dto';
import UpdateWorkflowTourDto from './dto/updateWorkflowTour.dto';

@ApiTags('user')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('user')
export default class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly pricingService: PricingService,
  ) {}

  @ApiOperation({ summary: 'Complete user registration' })
  @ApiCreatedResponse({
    description: 'User successfully registered',
    type: User,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized (invalid or missing JWT)',
  })
  @ApiForbiddenResponse({ description: 'User is already registered' })
  @Throttle({ default: { limit: 5, ttl: 3600000 } })
  @Post('register')
  @UseGuards(JwtAuthGuard)
  async register(
    @UserEmail() email: string,
    @Body() dto: CreateAccountDto,
  ): Promise<ReturnUserDto> {
    const user = await this.userService.register(dto, email);
    await this.pricingService.assignFreePlan(user.uuid);
    return user;
  }

  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiOkResponse({ description: 'User retrieved successfully', type: User })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized (invalid or missing JWT)',
  })
  @ApiForbiddenResponse({
    description: 'User is not fully registered',
  })
  @ApiBearerAuth('jwt')
  @Throttle({ default: { limit: 20, ttl: 3600000 } })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(
    @Req() req: Request & { user: { email: string } },
  ): Promise<ReturnUserDto | null> {
    const user = await this.userService.findByEmail(req.user.email);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @ApiOperation({ summary: 'Update workflow tour progress' })
  @ApiBody({ type: UpdateWorkflowTourDto })
  @ApiOkResponse({
    description: 'Workflow tour updated successfully',
    type: ReturnUserDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized (invalid or missing JWT)',
  })
  @ApiBearerAuth('jwt')
  @Patch('workflow-tour')
  @UseGuards(JwtAuthGuard)
  async updateWorkflowTour(
    @UserEmail() email: string,
    @Body() dto: UpdateWorkflowTourDto,
  ): Promise<ReturnUserDto> {
    return this.userService.updateWorkflowTour(email, dto);
  }

  @SkipThrottle()
  @Get('session')
  @UseGuards(JwtAuthGuard)
  async session(
    @Req() req: Request & { user: { email: string } },
  ): Promise<SessionResponseDto> {
    const { email } = req.user;
    const user = await this.userService.findByEmail(email as string);
    return { registered: !!user, user: user ?? null };
  }
}
