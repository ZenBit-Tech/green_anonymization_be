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
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import JwtAuthGuard from '@modules/auth/guards/jwt-auth.guard';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import UserEmail from '@common/utils/decorators/user-email.decorator';
import PricingService from '@modules/pricing/pricing.service';
import UserService from './user.service';
import CreateAccountDto from './dto/createAccount.dto';
import ReturnUserDto from './dto/returnUser.dto';
import SessionResponseDto from './dto/sessionResponse.dto';
import UpdateWorkflowTourDto from './dto/updateWorkflowTour.dto';
import AvatarResponseDto from './dto/avatarResponse.dto';
import UpdateProfileDto from './dto/updateProfile.dto';

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
    type: ReturnUserDto,
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
  @ApiOkResponse({
    description: 'User retrieved successfully',
    type: ReturnUserDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized (invalid or missing JWT)',
  })
  @ApiForbiddenResponse({
    description: 'User is not fully registered',
  })
  @ApiBearerAuth('jwt')
  @Throttle({ default: { limit: 20, ttl: 3600000 } })
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(
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

  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiOkResponse({
    description: 'Avatar uploaded successfully',
    type: AvatarResponseDto,
  })
  @ApiBadRequestResponse({ description: 'No file provided or invalid type' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiInternalServerErrorResponse({ description: 'Failed to upload avatar' })
  @ApiBearerAuth('jwt')
  @Patch('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UserEmail() email: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<AvatarResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException(
        'Only JPEG, PNG and WEBP images are allowed',
      );
    }
    return this.userService.uploadAvatar(email, file);
  }

  @ApiOperation({
    summary: 'Update profile fields (firstName, lastName, companyName)',
  })
  @ApiBody({ type: UpdateProfileDto })
  @ApiOkResponse({ description: 'Profile updated', type: ReturnUserDto })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiInternalServerErrorResponse({ description: 'Failed to update profile' })
  @ApiBearerAuth('jwt')
  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @UserEmail() email: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<ReturnUserDto> {
    return this.userService.updateProfile(email, dto);
  }

  @ApiOperation({
    summary: 'Get current user session',
  })
  @ApiOkResponse({
    description: 'Session retrieved successfully',
    type: SessionResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized (invalid or missing JWT)',
  })
  @ApiBearerAuth('jwt')
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
