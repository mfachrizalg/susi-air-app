import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../../common/public.decorator.js';
import { TOKEN_COOKIE } from '../../config.js';
import { SessionStore } from './session.store.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
    private readonly sessions: SessionStore,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const token =
      req.cookies?.[TOKEN_COOKIE] ?? bearerToken(req.headers.authorization);
    if (!token) throw new UnauthorizedException('Authentication required');
    let payload: { jti?: string };
    try {
      payload = await this.jwt.verifyAsync<{ jti?: string }>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
    const sid = payload.jti;
    if (!sid || !this.sessions.isActive(sid))
      throw new UnauthorizedException('Session ended, sign in again');
    return true;
  }
}

export function bearerToken(header: string | undefined): string | undefined {
  const [scheme, token] = header?.split(' ') ?? [];
  return scheme?.toLowerCase() === 'bearer' ? token : undefined;
}
