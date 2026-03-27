import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateApiKeyDto {
  @ApiProperty({ description: 'Name for the API key' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Scopes granted to this key', required: false, type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  scopes?: string[];
}
