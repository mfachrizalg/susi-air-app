import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, timingSafeEqual } from 'node:crypto';
import { type AppConfig, CONFIG } from '../../config.js';

const digest = (value: string): Buffer =>
  createHash('sha256').update(value).digest();
const same = (given: string, expected: string): boolean =>
  timingSafeEqual(digest(given), digest(expected));

export interface Session {
  token: string;
  expiresAt: string;
  maxAgeMs: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    @Inject(CONFIG) private readonly config: AppConfig,
  ) {}

  async login(username: string, password: string): Promise<Session> {
    const userOk = same(username, this.config.loginUsername);
    const passOk = same(password, this.config.loginPassword);
    if (!userOk || !passOk)
      throw new UnauthorizedException('Invalid username or password');

    const token = await this.jwt.signAsync({ sub: username });
    const { iat, exp } = this.jwt.decode<{ iat: number; exp: number }>(token);
    return {
      token,
      expiresAt: new Date(exp * 1000).toISOString(),
      maxAgeMs: (exp - iat) * 1000,
    };
  }
}
