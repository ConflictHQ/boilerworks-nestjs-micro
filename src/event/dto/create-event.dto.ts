import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ description: 'Event type identifier' })
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiProperty({ description: 'Event payload', type: Object })
  @IsObject()
  @IsNotEmpty()
  payload!: Record<string, unknown>;
}
