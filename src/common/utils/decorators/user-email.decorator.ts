import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const UserEmail = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.email;
  },
);

export default UserEmail;
