import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async findManyEvents(args?: Parameters<PrismaClient['event']['findMany']>[0]) {
    const where = {
      ...args?.where,
      deletedAt: args?.where?.deletedAt !== undefined ? args.where.deletedAt : null,
    };
    return this.event.findMany({ ...args, where });
  }

  async findFirstEvent(args?: Parameters<PrismaClient['event']['findFirst']>[0]) {
    const where = {
      ...args?.where,
      deletedAt: args?.where?.deletedAt !== undefined ? args.where.deletedAt : null,
    };
    return this.event.findFirst({ ...args, where });
  }
}
