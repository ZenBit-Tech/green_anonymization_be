import { GoogleUser } from '@/modules/auth/types/GoogleUser';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const GoogleUserDecorator = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): GoogleUser => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user?: GoogleUser }>();
    if (!request.user) {
      throw new Error('No Google user found on request');
    }
    return request.user;
  },
);

export default GoogleUserDecorator;
