import { expect, test, type Page } from '@playwright/test';

const USERNAME = 'johndoe';
const PASSWORD = 'susiairtest';

async function signIn(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Username').fill(USERNAME);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  // The first visit to Home compiles its chunks in dev mode, so allow more than the default 5 s.
  await expect(page.getByRole('heading', { name: 'John Doe' })).toBeVisible({ timeout: 15_000 });
}

async function openSchedule(page: Page) {
  await signIn(page);
  await page.getByRole('link', { name: 'Schedule', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'May 2026' })).toBeVisible();
}

test('bad credentials show the API message', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username').fill(USERNAME);
  await page.getByLabel('Password').fill('wrong-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Invalid username or password' })).toBeVisible();
});

test('home shows pilot, limit cards, chart and documents', async ({ page }) => {
  await signIn(page);
  await expect(page.getByText('1,444.5', { exact: true })).toBeVisible();

  await expect(page.getByRole('progressbar')).toHaveCount(4);

  const chart = page.getByRole('region', { name: 'Flight hours trend' });
  await expect(chart.locator('svg')).toBeVisible();
  await expect(chart.locator('svg path[fill="#22C5E8"]')).toHaveCount(15);
  await expect(chart.locator('svg path[stroke="#E63757"]')).toHaveCount(1);

  await page.getByRole('button', { name: '1M' }).click();
  await expect(page.getByRole('button', { name: '1M' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: '1W' })).toHaveAttribute('aria-pressed', 'false');

  const documents = page.getByRole('region', { name: 'My documents' });
  await expect(documents.getByText('Expired', { exact: true })).toHaveCount(1);
  await expect(documents.getByText('Soon', { exact: true })).toHaveCount(2);
  await expect(documents.getByText('Safe', { exact: true })).toHaveCount(2);

  await expect(page.getByRole('link', { name: 'Logbook', exact: true })).toHaveAttribute('aria-disabled', 'true');
  await expect(page.getByRole('link', { name: 'More', exact: true })).toHaveAttribute('aria-disabled', 'true');
});

test('schedule opens on May 2026 with Sunday as the first column', async ({ page }) => {
  await openSchedule(page);
  await expect(page.getByRole('columnheader').first()).toHaveText('Sun');
});

test('previous month shows April and requests month 04', async ({ page }) => {
  await openSchedule(page);
  const request = page.waitForRequest((req) => req.url().includes('/api/schedules?year=2026&month=04'));
  await page.getByRole('button', { name: 'Previous month' }).click();
  await request;
  await expect(page.getByRole('heading', { name: 'April 2026' })).toBeVisible();
});

test('tapping day 15 opens the detail placeholder', async ({ page }) => {
  await openSchedule(page);
  await page.getByRole('link', { name: /^15 May 2026/ }).click();
  await expect(page.getByText('Detail page coming soon')).toBeVisible();
});

test('token cookie is HttpOnly and SameSite=Strict, and not readable from JavaScript', async ({ page }) => {
  await signIn(page);
  const cookies = await page.context().cookies();
  const token = cookies.find((cookie) => cookie.name === 'token');
  expect(token?.httpOnly).toBe(true);
  expect(token?.sameSite).toBe('Strict');
  expect(await page.evaluate(() => document.cookie)).not.toContain('token=');
});
