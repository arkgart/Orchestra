import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/frontend',
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:3000'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
