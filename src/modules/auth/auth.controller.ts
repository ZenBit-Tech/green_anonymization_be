import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiQuery,
} from '@nestjs/swagger';
import AuthService from './auth.service';
import LoginRequestDto from './dto/login.request.dto';
import MagicLinkAuthGuard from './guards/magic-link.auth.guard';

@ApiTags('auth')
@Controller('auth')
export default class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Request a magic login link via email' })
  @ApiOkResponse({ description: 'Magic link sent to email' })
  @ApiBadRequestResponse({ description: 'Invalid email provided' })
  async login(@Body() dto: LoginRequestDto) {
    const token = await this.authService.generateMagicToken(dto.destination);
    return { message: 'Magic link sent to email', token };
  }

  @Get('verify')
  @UseGuards(MagicLinkAuthGuard)
  @ApiOperation({ summary: 'Verify magic link and authenticate user' })
  @ApiQuery({ name: 'token', required: true })
  @ApiOkResponse({ description: 'User authenticated successfully' })
  @ApiBadRequestResponse({ description: 'Invalid or missing token' })
  async verify(@Req() req, @Res({ passthrough: true }) res: Response) {
    const { email } = req.user;
    const { accessToken, refreshToken, isRegistered } =
      await this.authService.generateAuthTokens(email as string);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });

    return {
      message: 'Authenticated successfully',
      isRegistered,
    };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token cookie' })
  @ApiOkResponse({ description: 'New access token issued' })
  @ApiBadRequestResponse({ description: 'Invalid or missing refresh token' })
  async refresh(@Req() req, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token missing' });
    }

    const { accessToken } = await this.authService.refreshTokens(
      refreshToken as string,
    );

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });

    return { message: 'Access token refreshed' };
  }
}
