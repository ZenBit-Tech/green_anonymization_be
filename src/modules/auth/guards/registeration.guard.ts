import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export default class RegistrationGuard implements CanActivate {
  constructor(private mode: 'registered' | 'unregistered') {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const isRegistered = req.user?.isRegistered;

    if (this.mode === 'registered' && !isRegistered) {
      throw new ForbiddenException('User not registered');
    }
    if (this.mode === 'unregistered' && isRegistered) {
      throw new ForbiddenException('Already registered');
    }

    return true;
  }
}
