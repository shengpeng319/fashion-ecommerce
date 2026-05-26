import { defineConfig, devices } from '@playwright/test'

const playwrightPort = process.env.PLAYWRIGHT_PORT || '3002'

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: `http://localhost:${playwrightPort}`,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `npm run dev -- --port ${playwrightPort}`,
    port: parseInt(playwrightPort),
    reuseExistingServer: true,
  },
})
