/** Injection token for the loaded configuration. */
export const CONFIG = 'CONFIG';

/** Name of the httpOnly cookie that carries the JWT. */
export const TOKEN_COOKIE = 'token';

/** A jsonwebtoken duration such as 8h, 30m or 3600s. */
export type JwtTtl = `${number}${'s' | 'm' | 'h' | 'd'}`;

export interface AppConfig {
  port: number;
  /** Reference date for every rule (D9). Never read from the system clock. */
  today: string;
  jwtSecret: string;
  jwtTtl: JwtTtl;
  publicUrl: string;
  cookieSecure: boolean;
  loginUsername: string;
  loginPassword: string;
  /** Browser origins allowed to call the API with credentials (CORS). */
  corsOrigins: string[];
}

const DEFAULT_TODAY = '2026-05-15';
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const production = env.NODE_ENV === 'production';
  const port = Number(env.PORT || 3001);
  const today = env.TODAY || DEFAULT_TODAY;
  if (!DATE.test(today))
    throw new Error(`TODAY must be YYYY-MM-DD, got "${today}"`);
  const jwtSecret = env.JWT_SECRET || (production ? '' : 'dev-only-secret');
  if (!jwtSecret)
    throw new Error('JWT_SECRET is required when NODE_ENV=production');
  const jwtTtl = env.JWT_TTL || '8h';
  if (!/^\d+[smhd]$/.test(jwtTtl))
    throw new Error(`JWT_TTL must look like 8h, 30m or 3600s, got "${jwtTtl}"`);
  const loginUsername = env.LOGIN_USERNAME || (production ? '' : 'johndoe');
  const loginPassword = env.LOGIN_PASSWORD || (production ? '' : 'susiairtest');
  if (!loginUsername || !loginPassword)
    throw new Error(
      'LOGIN_USERNAME and LOGIN_PASSWORD are required when NODE_ENV=production',
    );
  const corsOrigins = (env.CORS_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  return {
    port,
    today,
    jwtSecret,
    jwtTtl: jwtTtl as JwtTtl,
    publicUrl: (env.PUBLIC_URL || `http://localhost:${port}`).replace(
      /\/$/,
      '',
    ),
    cookieSecure: env.COOKIE_SECURE ? env.COOKIE_SECURE === 'true' : production,
    loginUsername,
    loginPassword,
    corsOrigins,
  };
}
