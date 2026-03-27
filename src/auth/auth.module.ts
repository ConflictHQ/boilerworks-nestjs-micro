import { Module } from '@nestjs/common';
import { ApiKeyGuard } from './api-key.guard.js';
import { ScopeGuard } from './scope.guard.js';

@Module({
  providers: [ApiKeyGuard, ScopeGuard],
  exports: [ApiKeyGuard, ScopeGuard],
})
export class AuthModule {}
