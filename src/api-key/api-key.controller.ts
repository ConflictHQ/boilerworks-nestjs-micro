import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { ApiKeyGuard } from '../auth/api-key.guard.js';
import { ScopeGuard } from '../auth/scope.guard.js';
import { RequireScope } from '../auth/require-scope.decorator.js';
import { ApiKeyService } from './api-key.service.js';
import { CreateApiKeyDto } from './dto/create-api-key.dto.js';

@ApiTags('api-keys')
@ApiSecurity('api-key')
@Controller('api-keys')
@UseGuards(ApiKeyGuard, ScopeGuard)
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post()
  @RequireScope('keys.manage')
  @ApiOperation({ summary: 'Create a new API key' })
  @ApiResponse({ status: 201, description: 'API key created successfully' })
  async create(@Body() dto: CreateApiKeyDto) {
    const result = await this.apiKeyService.createKey(dto.name, dto.scopes);
    return {
      ok: true,
      message: 'API key created. Store the plaintext key — it will not be shown again.',
      data: result,
    };
  }

  @Get()
  @RequireScope('keys.manage')
  @ApiOperation({ summary: 'List all API keys' })
  @ApiResponse({ status: 200, description: 'List of API keys' })
  async list() {
    const keys = await this.apiKeyService.listKeys();
    return { ok: true, data: keys };
  }

  @Delete(':id')
  @RequireScope('keys.manage')
  @ApiOperation({ summary: 'Revoke an API key' })
  @ApiResponse({ status: 200, description: 'API key revoked' })
  async revoke(@Param('id') id: string) {
    const key = await this.apiKeyService.revokeKey(id);
    return { ok: true, message: 'API key revoked', data: key };
  }
}
