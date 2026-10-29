import { defineConfig } from '@playwright/test';

// 回归测试针对本地静态预览（npm run build && npm run preview）。
// - baseURL 可用 PLAYWRIGHT_BASE_URL 覆盖，默认 http://127.0.0.1:4321/
// - 本机已装 Google Chrome 时可用 PLAYWRIGHT_CHANNEL=chrome，无需安装 Playwright 浏览器
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  fullyParallel: true,
  retries: 0,
  workers: undefined,
  reporter: [['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4321/',
    channel: process.env.PLAYWRIGHT_CHANNEL,
  },
});
