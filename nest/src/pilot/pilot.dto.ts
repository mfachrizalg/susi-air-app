import { ApiProperty } from '@nestjs/swagger';

export class PilotMeDto {
  @ApiProperty({ example: 'John Doe' })
  name!: string;

  @ApiProperty({
    example: 1444.5,
    description: 'Profile total. Includes hours logged after today.',
  })
  totalFlightHours!: number;

  @ApiProperty({ example: 'http://localhost:3001/assets/avatar.svg' })
  avatarUrl!: string;

  @ApiProperty({ format: 'date', example: '2026-05-15' })
  today!: string;
}
