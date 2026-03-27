import { ApiProperty } from '@nestjs/swagger';

export class ApiResponse<T> {
  @ApiProperty()
  ok!: boolean;

  @ApiProperty({ required: false })
  message?: string;

  @ApiProperty({ required: false })
  data?: T;

  @ApiProperty({ required: false, type: [String] })
  errors?: string[];
}
