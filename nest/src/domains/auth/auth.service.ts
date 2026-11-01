import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, timingSafeEqual } from 'node:crypto';
import { type AppConfig, CONFIG } from '../../config.js';

// Hashing both sides gives equal-length buffers, which timingSafeEqual requires.
const digest = (value: string): Buffer =>
  createHash('sha256').update(value).digest();
const same = (given: string, expected: string): boolean =>
  timingSafeEqual(digest(given), digest(expected));

export interface Session {
  token: string;
  expiresAt: string;
  /** Token lifetime in ms, used as the cookie Max-Age. */
  maxAgeMs: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    @Inject(CONFIG) private readonly config: AppConfig,
  ) {}

  async login(username: string, password: string): Promise<Session> {
    // Both comparisons always run, so timing does not reveal which field was wrong.
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
