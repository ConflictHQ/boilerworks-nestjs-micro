import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { ApiKeyGuard } from '../auth/api-key.guard.js';
import { ScopeGuard } from '../auth/scope.guard.js';
import { RequireScope } from '../auth/require-scope.decorator.js';
import { EventService } from './event.service.js';
import { CreateEventDto } from './dto/create-event.dto.js';
import { EventFilterDto } from './dto/event-filter.dto.js';

@ApiTags('events')
@ApiSecurity('api-key')
@Controller('events')
@UseGuards(ApiKeyGuard, ScopeGuard)
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @RequireScope('events.write')
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({ status: 201, description: 'Event created' })
  async create(@Body() dto: CreateEventDto) {
    const event = await this.eventService.create(dto.type, dto.payload);
    return { ok: true, data: event };
  }

  @Get()
  @RequireScope('events.read')
  @ApiOperation({ summary: 'List events' })
  @ApiResponse({ status: 200, description: 'List of events' })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'status', required: false })
  async list(@Query() filters: EventFilterDto) {
    const events = await this.eventService.findAll(filters);
    return { ok: true, data: events };
  }

  @Get(':id')
  @RequireScope('events.read')
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiResponse({ status: 200, description: 'Event details' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async findOne(@Param('id') id: string) {
    const event = await this.eventService.findById(id);
    return { ok: true, data: event };
  }

  @Delete(':id')
  @RequireScope('events.write')
  @ApiOperation({ summary: 'Soft delete an event' })
  @ApiResponse({ status: 200, description: 'Event soft deleted' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async remove(@Param('id') id: string) {
    const event = await this.eventService.softDelete(id);
    return { ok: true, message: 'Event deleted', data: event };
  }
}
