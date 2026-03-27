import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  async create(type: string, payload: object) {
    return this.prisma.event.create({
      data: { type, payload },
    });
  }

  async findAll(filters: { type?: string; status?: string }) {
    return this.prisma.findManyEvents({
      where: {
        ...(filters.type ? { type: filters.type } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const event = await this.prisma.findFirstEvent({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException(`Event ${id} not found`);
    }

    return event;
  }

  async softDelete(id: string) {
    const event = await this.prisma.findFirstEvent({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException(`Event ${id} not found`);
    }

    return this.prisma.event.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
