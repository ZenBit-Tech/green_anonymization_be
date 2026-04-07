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
import { ApiTags } from '@nestjs/swagger';
import JwtAuthGuard from '@modules/auth/guards/jwt-auth.guard';
import RegistrationGuard from '@/modules/auth/guards/registeration.guard';
import UserEmail from '@/common/utils/decorators/user-email.decorator';
import UserService from './user.service';
import CreateAccountDto from './dto/createAccount.dto';

@ApiTags('user')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('user')
export default class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard, new RegistrationGuard('unregistered'))
  async register(@UserEmail() email: string, @Body() dto: CreateAccountDto) {
    return this.userService.completeRegistration({ ...dto, email });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, new RegistrationGuard('registered'))
  async getMe(@Req() req: Request & { user: { email: string } }) {
    return this.userService.findByEmail(req.user.email);
  }
}
