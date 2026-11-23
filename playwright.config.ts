import { defineConfig } from '@playwright/test'

const origin = 'http://127.0.0.1:4180'
const baseURL = origin + '/kids-coloring-studio/'

export default defineConfig({
  testDir: './tests',
  workers: 1,
  use: {
    baseURL,
    hasTouch: true,
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH },
  },
  webServer: {
    command: 'node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4180 --strictPort',
    url: baseURL,
    reuseExistingServer: false,
  },
})
