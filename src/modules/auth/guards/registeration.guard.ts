import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { USER_REGISTRATION_STATUS } from '@common/constants';

@Injectable()
export default class RegistrationGuard implements CanActivate {
  constructor(private mode: 'registered' | 'unregistered') {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const isRegistered = req.user?.isRegistered;
    if (this.mode === USER_REGISTRATION_STATUS.REGISTERED && !isRegistered) {
      throw new ForbiddenException('User not registered');
    }
    if (this.mode === USER_REGISTRATION_STATUS.UNREGISTERED && isRegistered) {
      throw new ForbiddenException('Already registered');
    }

    return true;
  }
}
