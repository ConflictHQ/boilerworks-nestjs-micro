import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ApiKeyService } from './api-key.service.js';
import { ApiKeyController } from './api-key.controller.js';

@Module({
  imports: [AuthModule],
  providers: [ApiKeyService],
  controllers: [ApiKeyController],
  exports: [ApiKeyService],
})
export class ApiKeyModule {}
