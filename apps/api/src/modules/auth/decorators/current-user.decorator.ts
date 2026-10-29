import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthRequest } from '../auth.types';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthRequest>();
    return request.user;
  },
);
