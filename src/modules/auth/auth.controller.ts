import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import AuthService from './auth.service';
import LoginRequestDto from './dto/loginRequest.dto';
import MagicLinkAuthGuard from './guards/magic-link.auth.guard';
import VerifyResponseDto from './dto/verifyResponse.dto';

@ApiTags('auth')
@Controller('auth')
export default class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Request a magic login link via email' })
  @ApiOkResponse({ description: 'Magic link sent to email' })
  @ApiBadRequestResponse({ description: 'Invalid email provided' })
  @Throttle({ default: { limit: 15, ttl: 3600000 } })
  @Post('login')
  async login(@Body() dto: LoginRequestDto): Promise<{ message: string }> {
    await this.authService.generateMagicToken(dto.destination);
    return { message: 'Magic link sent to email' };
  }

  @ApiOperation({ summary: 'Verify magic link and authenticate user' })
  @ApiQuery({ name: 'token', required: true })
  @ApiOkResponse({ description: 'User authenticated successfully' })
  @ApiBadRequestResponse({ description: 'Invalid or missing token' })
  @Throttle({ default: { limit: 20, ttl: 3600000 } })
  @Get('verify')
  @UseGuards(MagicLinkAuthGuard)
  async verify(@Req() req): Promise<VerifyResponseDto> {
    const { email } = req.user;

    const { accessToken, refreshToken } =
      await this.authService.generateAuthTokens(email as string);

    return {
      message: 'Authenticated successfully',
      accessToken,
      refreshToken,
    };
  }

  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiOkResponse({ description: 'New access token issued' })
  @ApiBadRequestResponse({ description: 'Invalid or missing refresh token' })
  @Throttle({ default: { limit: 5, ttl: 3600000 } })
  @Post('refresh')
  async refresh(
    @Body('refreshToken') refreshToken: string,
  ): Promise<{ accessToken: string }> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const accessToken = await this.authService.refreshAccessToken(refreshToken);

    return { accessToken };
  }
}
