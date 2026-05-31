import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  UnauthorizedException,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiQuery,
  ApiProduces,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import OAuthUserDecorator from '@/common/utils/decorators/oauth-user.decorator';
import AuthService from './auth.service';
import LoginRequestDto from './dto/loginRequest.dto';
import MagicLinkAuthGuard from './guards/magic-link.auth.guard';
import VerifyResponseDto from './dto/verifyResponse.dto';
import GoogleOauthGuard from './guards/google-oauth,guard';
import MicrosoftOauthGuard from './guards/microsoft-oatuh.guard';
import type { OAuthUser } from './types';

@ApiTags('auth')
@Controller('auth')
export default class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @ApiOperation({ summary: 'Request a magic login link via email' })
  @ApiOkResponse({ description: 'Magic link sent to email' })
  @ApiBadRequestResponse({ description: 'Invalid email provided' })
  @Throttle({ default: { limit: 15, ttl: 3600000 } })
  @Post('login')
  async login(
    @Body() dto: LoginRequestDto,
    @Req() req,
  ): Promise<{ message: string }> {
    await this.authService.generateMagicToken(
      dto.destination,
      req.headers.origin as string,
    );
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

  // eslint-disable-next-line class-methods-use-this
  @ApiOperation({
    summary: 'Start Google OAuth login flow',
    description:
      'Redirects the user to Google for authentication. No response body is returned.',
  })
  @ApiProduces('text/html')
  @ApiOkResponse({
    description: 'Redirects user to Google authentication page',
  })
  @ApiBadRequestResponse({
    description: 'Google OAuth initiation failed',
  })
  @Get('google')
  @UseGuards(GoogleOauthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async googleAuth() {}

  @ApiOperation({
    summary: 'Google OAuth callback',
    description:
      'Handles Google redirect after authentication and issues an internal auth token, then redirects to frontend.',
  })
  @ApiProduces('text/html')
  @ApiOkResponse({
    description: 'Redirects user to frontend with authentication token',
  })
  @ApiBadRequestResponse({
    description: 'Invalid Google OAuth response or user extraction failed',
  })
  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(
    @OAuthUserDecorator() user: OAuthUser,
    @Res() res: Response,
    @Req() req,
  ) {
    const token = await this.authService.generateMagicToken(
      user.email as string,
      req.headers.origin as string,
    );
    return res.redirect(
      `${this.configService.getOrThrow<string>('FRONTEND_ORIGIN')}/auth-callback?token=${token}`,
    );
  }

  // eslint-disable-next-line class-methods-use-this
  @ApiOperation({
    summary: 'Start Microsoft OAuth login flow',
    description:
      'Redirects the user to Microsoft login (Entra ID or personal Microsoft account). No JSON response is returned.',
  })
  @ApiProduces('text/html')
  @ApiOkResponse({
    description: 'Redirects user to Microsoft authentication page',
  })
  @ApiBadRequestResponse({
    description: 'Microsoft OAuth initiation failed',
  })
  @Get('microsoft')
  @UseGuards(MicrosoftOauthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async microsoftAuth() {}

  @ApiOperation({
    summary: 'Microsoft OAuth callback',
    description:
      'Handles Microsoft OAuth callback, creates internal auth token, and redirects to frontend application.',
  })
  @ApiProduces('text/html')
  @ApiOkResponse({
    description: 'Redirects user to frontend with authentication token',
  })
  @ApiBadRequestResponse({
    description: 'Invalid Microsoft OAuth response or missing user info',
  })
  @Get('microsoft/callback')
  @UseGuards(MicrosoftOauthGuard)
  async microsoftAuthCallback(
    @OAuthUserDecorator() user: OAuthUser,
    @Res() res: Response,
    @Req() req,
  ) {
    const token = await this.authService.generateMagicToken(
      user.email as string,
      req.headers.origin as string,
    );
    return res.redirect(
      `${this.configService.getOrThrow<string>('FRONTEND_ORIGIN')}/auth-callback?token=${token}`,
    );
  }
}
