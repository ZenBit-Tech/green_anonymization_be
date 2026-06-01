import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import EmailModule from '@modules/email/email.module';
import UserModule from '@modules/user/user.module';
import AuthService from './auth.service';
import AuthController from './auth.controller';
import JwtStrategy from './strategies/jwt.strategy';
import MagicLoginStrategy from './strategies/magic-link.strategy';
import GoogleStrategy from './strategies/google.strategy';
import MicrosoftStrategy from './strategies/microsoft.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    UserModule,
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    MagicLoginStrategy,
    JwtStrategy,
    GoogleStrategy,
    MicrosoftStrategy,
  ],
  exports: [AuthService],
})
export default class AuthModule {}
