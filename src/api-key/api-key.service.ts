import { Injectable } from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ApiKeyService {
  constructor(private readonly prisma: PrismaService) {}

  async createKey(name: string, scopes: string[] = []) {
    const plaintext = randomBytes(32).toString('hex');
    const keyHash = createHash('sha256').update(plaintext).digest('hex');

    const key = await this.prisma.apiKey.create({
      data: { name, keyHash, scopes },
    });

    return {
      id: key.id,
      name: key.name,
      scopes: key.scopes,
      isActive: key.isActive,
      lastUsedAt: key.lastUsedAt,
      createdAt: key.createdAt,
      plaintext,
    };
  }

  async listKeys() {
    return this.prisma.apiKey.findMany({
      select: {
        id: true,
        name: true,
        scopes: true,
        isActive: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });
  }

  async revokeKey(id: string) {
    return this.prisma.apiKey.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        name: true,
        scopes: true,
        isActive: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });
  }
}
