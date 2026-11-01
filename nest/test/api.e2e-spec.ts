import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { configureApp } from '../src/app-config.js';
import { AppModule } from '../src/app.module.js';

let app: NestExpressApplication;
const api = () => request(app.getHttpServer());
const credentials = { username: 'johndoe', password: 'susiairtest' };

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  app = moduleRef.createNestApplication<NestExpressApplication>();
  configureApp(app);
  await app.init();
});

afterAll(async () => {
  await app?.close();
});

/** Logs in and returns the bearer token plus the `token=...` cookie pair. */
async function login(): Promise<{ token: string; cookie: string }> {
  const res = await api().post('/auth/login').send(credentials).expect(200);
  const setCookie: string = res.headers['set-cookie'][0];
  return { token: res.body.data.token, cookie: setCookie.split(';')[0] };
}

describe('auth', () => {
  it('login returns the token envelope and sets an httpOnly, SameSite=Strict cookie for 8h', async () => {
    const res = await api().post('/auth/login').send(credentials).expect(200);
    expect(res.body).toMatchObject({
      success: true,
      statusCode: 200,
      message: 'OK',
      data: { token: expect.any(String), expiresAt: expect.any(String) },
    });
    const attrs = (res.headers['set-cookie'][0] as string)
      .split(';')
      .map((part) => part.trim());
    expect(attrs[0]).toMatch(/^token=/);
    expect(attrs).toContain('HttpOnly');
    expect(attrs).toContain('SameSite=Strict');
    expect(attrs).toContain('Max-Age=28800');
    expect(attrs).not.toContain('Secure');
  });

  it('bad credentials return 401 with the error envelope', async () => {
    const res = await api()
      .post('/auth/login')
      .send({ ...credentials, password: 'wrong' })
      .expect(401);
    expect(res.body).toMatchObject({
      success: false,
      statusCode: 401,
      message: 'Invalid username or password',
      path: '/auth/login',
    });
    expect(typeof res.body.timestamp).toBe('string');
  });

  it('an empty field returns 400 with an errors list', async () => {
    const res = await api()
      .post('/auth/login')
      .send({ username: '', password: 'x' })
      .expect(400);
    expect(res.body).toMatchObject({
      success: false,
      statusCode: 400,
      message: 'Validation failed',
    });
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it('a guarded route without a token returns 401 with the envelope', async () => {
    const res = await api().get('/pilot/me').expect(401);
    expect(res.body).toMatchObject({
      success: false,
      statusCode: 401,
      path: '/pilot/me',
    });
  });

  it('a guarded route accepts the token cookie', async () => {
    const { cookie } = await login();
    await api().get('/pilot/me').set('Cookie', cookie).expect(200);
  });

  it('a guarded route accepts a Bearer token', async () => {
    const { token } = await login();
    await api()
      .get('/pilot/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('a forged token returns 401', async () => {
    const res = await api()
      .get('/pilot/me')
      .set('Authorization', 'Bearer abc.def.ghi')
      .expect(401);
    expect(res.body).toMatchObject({
      success: false,
      statusCode: 401,
      message: 'Invalid or expired token',
    });
  });
});

describe('pilot', () => {
  it('returns the profile, the header total, today and the avatar URL', async () => {
    const { cookie } = await login();
    const res = await api().get('/pilot/me').set('Cookie', cookie).expect(200);
    expect(res.body.data).toEqual({
      name: 'John Doe',
      totalFlightHours: 1444.5,
      avatarUrl: 'http://localhost:3001/assets/avatar.svg',
      today: '2026-05-15',
    });
  });

  it('serves the avatar without auth', async () => {
    const res = await api().get('/assets/avatar.svg').expect(200);
    expect(res.headers['content-type']).toMatch(/image\/svg\+xml/);
  });
});

describe('flight hours', () => {
  it('lists one row per day and reads 0 for days with no log', async () => {
    const { cookie } = await login();
    const empty = await api()
      .get('/flight-hours?from=2020-01-01&to=2020-01-02')
      .set('Cookie', cookie)
      .expect(200);
    expect(empty.body.data).toEqual([
      { date: '2020-01-01', hours: 0 },
      { date: '2020-01-02', hours: 0 },
    ]);
    const today = await api()
      .get('/flight-hours?from=2026-05-14&to=2026-05-15')
      .set('Cookie', cookie)
      .expect(200);
    expect(today.body.data.at(-1)).toEqual({ date: '2026-05-15', hours: 6.4 });
  });

  it('rejects from after to, an impossible date, and a span over 366 days with 400', async () => {
    const { cookie } = await login();
    for (const query of [
      'from=2026-05-15&to=2026-05-14',
      'from=2026-02-30&to=2026-03-01',
      'from=2025-01-01&to=2026-05-15',
    ]) {
      await api()
        .get(`/flight-hours?${query}`)
        .set('Cookie', cookie)
        .expect(400);
    }
  });

  it('the 1W summary has 15 points, projects 16 to 22 May and carries four cards', async () => {
    const { cookie } = await login();
    const res = await api()
      .get('/flight-hours/summary?range=1w')
      .set('Cookie', cookie)
      .expect(200);
    const d = res.body.data;
    expect(d).toMatchObject({ range: '1w', limit: 40, max: 45, windowDays: 7 });
    expect(d.points.map((p: { hours: number }) => p.hours)).toEqual([
      15.0, 15.0, 16.6, 12.6, 16.3, 22.2, 24.0, 25.2, 31.4, 36.4, 42.8, 44.0,
      44.7, 42.7, 36.3,
    ]);
    expect(
      d.points
        .filter((p: { projected: boolean }) => p.projected)
        .map((p: { date: string }) => p.date),
    ).toEqual([
      '2026-05-16',
      '2026-05-17',
      '2026-05-18',
      '2026-05-19',
      '2026-05-20',
      '2026-05-21',
      '2026-05-22',
    ]);
    expect(d.cards).toEqual([
      { key: 'daily', label: 'Daily', hours: 6.4, limit: 8 },
      { key: 'weekly', label: 'Weekly', hours: 25.2, limit: 40 },
      { key: 'monthly', label: 'Monthly', hours: 87.2, limit: 100 },
      { key: 'annual', label: 'Annual', hours: 1013.8, limit: 1050 },
    ]);
  });

  it('the 1M series starts at 102.2 and its centre is the monthly card', async () => {
    const { cookie } = await login();
    const res = await api()
      .get('/flight-hours/summary?range=1m')
      .set('Cookie', cookie)
      .expect(200);
    expect(res.body.data.points).toHaveLength(15);
    expect(res.body.data.points[0].hours).toBe(102.2);
    expect(res.body.data.points[7].hours).toBe(87.2);
  });

  it('rejects an unknown range with 400', async () => {
    const { cookie } = await login();
    await api()
      .get('/flight-hours/summary?range=2w')
      .set('Cookie', cookie)
      .expect(400);
  });
});

describe('documents', () => {
  it('lists the five documents in file order with days remaining and status', async () => {
    const { cookie } = await login();
    const res = await api().get('/documents').set('Cookie', cookie).expect(200);
    expect(res.body.data.warningDays).toBe(30);
    expect(
      res.body.data.documents.map(
        (d: { id: string; daysRemaining: number; status: string }) => [
          d.id,
          d.daysRemaining,
          d.status,
        ],
      ),
    ).toEqual([
      ['doc_recurrent', 152, 'safe'],
      ['doc_ppc', 224, 'safe'],
      ['doc_license', 14, 'soon'],
      ['doc_medical', 27, 'soon'],
      ['doc_security', -14, 'expired'],
    ]);
  });
});

describe('schedules', () => {
  it('May 2026 has 21 rows, with 97027 fully logged and a label from its base', async () => {
    const { cookie } = await login();
    const res = await api()
      .get('/schedules?year=2026&month=05')
      .set('Cookie', cookie)
      .expect(200);
    const d = res.body.data;
    expect(d).toMatchObject({ year: 2026, month: 5 });
    expect(d.legend).toHaveLength(10);
    expect(d.schedules).toHaveLength(21);
    expect(
      d.schedules.find((s: { id: string }) => s.id === '97027'),
    ).toMatchObject({
      label: 'MKW',
      remaining: 0,
    });
  });

  it('June 2026 row 97041 is labelled TRX and keeps its base_color', async () => {
    const { cookie } = await login();
    const res = await api()
      .get('/schedules?year=2026&month=06')
      .set('Cookie', cookie)
      .expect(200);
    expect(res.body.data.schedules).toHaveLength(16);
    expect(
      res.body.data.schedules.find((s: { id: string }) => s.id === '97041'),
    ).toMatchObject({
      label: 'TRX',
      base_color: '#FBA577',
    });
  });

  it('April 2026 has 17 rows', async () => {
    const { cookie } = await login();
    const res = await api()
      .get('/schedules?year=2026&month=04')
      .set('Cookie', cookie)
      .expect(200);
    expect(res.body.data.schedules).toHaveLength(17);
  });

  it('rejects month 13 and a non-four-digit year with 400', async () => {
    const { cookie } = await login();
    await api()
      .get('/schedules?year=2026&month=13')
      .set('Cookie', cookie)
      .expect(400);
    await api()
      .get('/schedules?year=26&month=05')
      .set('Cookie', cookie)
      .expect(400);
  });
});

describe('cors', () => {
  it('lets the web origin call the API with credentials', async () => {
    const res = await api()
      .options('/auth/login')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type')
      .expect(204);
    expect(res.headers['access-control-allow-origin']).toBe(
      'http://localhost:3000',
    );
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  it('gives no CORS header to other origins', async () => {
    const res = await api()
      .post('/auth/login')
      .set('Origin', 'http://evil.example')
      .send(credentials)
      .expect(200);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});

describe('swagger', () => {
  it('serves the UI at /docs with the cookie and bearer security schemes', async () => {
    await api().get('/docs').expect(200);
    const init = await api().get('/docs/swagger-ui-init.js').expect(200);
    expect(init.text).toContain('"securitySchemes"');
    expect(init.text).toContain('"cookie"');
    expect(init.text).toContain('"bearer"');
  });

  it('no longer serves the raw OpenAPI document at /docs-json', async () => {
    await api().get('/docs-json').expect(404);
  });
});
