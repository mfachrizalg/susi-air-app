import { defineConfig, devices } from '@playwright/test';

// Expects the API on port 3001 and the Nuxt dev server on port 3000, unless BASE_URL is set.
export default defineConfig({
  testDir: './e2e',
  use: { baseURL: process.env.BASE_URL ?? 'http://localhost:3000' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'mobile-390',
      // Set viewport after spreading the device, because devices define their own viewport.
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } },
    },
  ],
});
