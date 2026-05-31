import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { OAuthUser } from '@/modules/auth/types';

const OAuthUserDecorator = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): OAuthUser => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user?: OAuthUser }>();
    if (!request.user) {
      throw new Error('No oatuh user found on request');
    }
    return request.user;
  },
);

export default OAuthUserDecorator;
