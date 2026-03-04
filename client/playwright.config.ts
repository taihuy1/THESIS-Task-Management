import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  // uncomment to auto-start servers before test run:
  // webServer: [
  //   { command: 'npm run dev', cwd: '../api', port: 3001, reuseExistingServer: true },
  //   { command: 'npm run dev', cwd: '.', port: 5173, reuseExistingServer: true },
  // ],
});
