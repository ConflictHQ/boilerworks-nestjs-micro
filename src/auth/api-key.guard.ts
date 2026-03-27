import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ApiKey } from '@prisma/client';

export interface RequestWithApiKey {
  headers: Record<string, string | undefined>;
  apiKey?: ApiKey;
}

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithApiKey>();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('Missing X-API-Key header');
    }

    const keyHash = createHash('sha256').update(apiKey).digest('hex');

    const key = await this.prisma.apiKey.findUnique({
      where: { keyHash },
    });

    if (!key || !key.isActive) {
      throw new UnauthorizedException('Invalid or revoked API key');
    }

    await this.prisma.apiKey.update({
      where: { id: key.id },
      data: { lastUsedAt: new Date() },
    });

    request.apiKey = key;

    return true;
  }
}
