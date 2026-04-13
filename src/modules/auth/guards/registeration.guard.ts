import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserRegistrationStatus } from '@common/constants';

@Injectable()
export default class RegistrationGuard implements CanActivate {
  constructor(private mode: UserRegistrationStatus) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const isRegistered = req.user?.isRegistered;
    if (this.mode === UserRegistrationStatus.REGISTERED && !isRegistered) {
      throw new ForbiddenException('User not registered');
    }
    if (this.mode === UserRegistrationStatus.UNREGISTERED && isRegistered) {
      throw new ForbiddenException('Already registered');
    }

    return true;
  }
}
