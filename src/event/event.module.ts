import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { EventService } from './event.service.js';
import { EventController } from './event.controller.js';

@Module({
  imports: [AuthModule],
  providers: [EventService],
  controllers: [EventController],
  exports: [EventService],
})
export class EventModule {}
