import { routes, type VercelConfig } from '@vercel/config/v1';

export const config: VercelConfig = {
  rewrites: [
    routes.rewrite('/api/:path*', 'https://nest-production-f9b4.up.railway.app/:path*'),
  ],
};
