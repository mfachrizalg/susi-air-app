import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'johndoe' })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ example: 'susiairtest' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class LoginResultDto {
  @ApiProperty({
    description:
      'HS256 JWT. The same token is set as the httpOnly `token` cookie.',
  })
  token!: string;

  @ApiProperty({ format: 'date-time', example: '2026-05-15T16:00:00.000Z' })
  expiresAt!: string;
}
