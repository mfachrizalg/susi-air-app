import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiEnvelope } from '../../common/api-envelope.decorators.js';
import { Public } from '../../common/public.decorator.js';
import { type AppConfig, CONFIG, TOKEN_COOKIE } from '../../config.js';
import { AuthService } from './auth.service.js';
import { LoginDto, LoginResultDto } from './login.dto.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    @Inject(CONFIG) private readonly config: AppConfig,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiEnvelope(LoginResultDto)
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResultDto> {
    const session = await this.auth.login(body.username, body.password);
    res.cookie(TOKEN_COOKIE, session.token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: this.config.cookieSecure,
      maxAge: session.maxAgeMs,
      path: '/',
    });
    return { token: session.token, expiresAt: session.expiresAt };
  }
}
