import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E 配置
 *
 * 用法：
 *   pnpm exec playwright test              # 跑全部
 *   pnpm exec playwright test e2e/auth     # 跑某个目录
 *   pnpm exec playwright test --ui         # UI 调试
 *
 * 前置条件：前端（端口 3000）+ 后端（端口 8083）已启动，并已执行 server/sql/init/ 下初始化脚本（见 server/sql/README.md）
 */
export default defineConfig({
    testDir: './e2e',
    timeout: 60_000,
    expect: { timeout: 10_000 },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: process.env.CI ? 1 : 2,
    reporter: process.env.CI ? 'list' : [['list'], ['html', { open: 'never', outputFolder: 'e2e-report' }]],

    use: {
        baseURL: 'http://localhost:3000',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        actionTimeout: 10_000,
        navigationTimeout: 30_000,
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    // 测试服务器由用户手动启动，避免与开发者本地端口冲突
    // webServer: {
    //   command: 'pnpm dev',
    //   url: 'http://localhost:3000',
    //   reuseExistingServer: true,
    //   timeout: 60_000,
    // },
});
