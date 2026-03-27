import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module.js';
import { ApiKeyModule } from './api-key/api-key.module.js';
import { EventModule } from './event/event.module.js';
import { HealthModule } from './health/health.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 10 }],
    }),
    PrismaModule,
    ApiKeyModule,
    EventModule,
    HealthModule,
  ],
})
export class AppModule {}
