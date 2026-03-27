import { ApiProperty } from '@nestjs/swagger';

export class ApiKeyResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ type: [String] })
  scopes!: string[];

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({ nullable: true })
  lastUsedAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;
}
