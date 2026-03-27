import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_SCOPE_KEY } from './require-scope.decorator.js';
import type { RequestWithApiKey } from './api-key.guard.js';

@Injectable()
export class ScopeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredScope = this.reflector.getAllAndOverride<string | undefined>(REQUIRE_SCOPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredScope) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithApiKey>();
    const apiKey = request.apiKey;

    if (!apiKey) {
      throw new ForbiddenException('No API key found on request');
    }

    const hasScope = apiKey.scopes.includes(requiredScope) || apiKey.scopes.includes('*');

    if (!hasScope) {
      throw new ForbiddenException(`Missing required scope: ${requiredScope}`);
    }

    return true;
  }
}
