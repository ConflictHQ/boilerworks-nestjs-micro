import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RequestWithApiKey } from './api-key.guard.js';

export const ApiKeyParam = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<RequestWithApiKey>();
  return request.apiKey;
});
