// E2E 测试共享工具

import type { APIResponse, Page } from '@playwright/test';

/**
 * 列表页详情链接：排除 /create、/edit，避免点到「发布/创建」入口。
 * 例：/pets/1 ✓  /pets/create ✗
 */
export function firstDetailLink(
    page: Page,
    base: 'pets' | 'lost-pets' | 'adopts' | 'posts',
) {
    return page
        .locator(`a[href^="/${base}/"]:not([href$="/create"]):not([href*="/edit"])`)
        .first();
}

/** 从页面 Cookie 读取 CSRF，供 page.request 写接口使用（axios 会自动带，APIRequestContext 不会） */
export async function getCsrfToken(page: Page): Promise<string> {
    const fromCookie = await page.evaluate(() => {
        const m = document.cookie.match(/(?:^|; )csrf_token=([^;]*)/);
        return m ? decodeURIComponent(m[1]) : '';
    });
    if (fromCookie) return fromCookie;

    const res = await page.request.get('/api/v1/csrf-token');
    const body = await res.json().catch(() => ({} as { data?: { csrfToken?: string } }));
    return body?.data?.csrfToken || '';
}

/** 带 CSRF + Bearer 的 request（token 在 localStorage，APIRequestContext 不会自动带） */
export async function apiWrite(
    page: Page,
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    options?: Parameters<Page['request']['post']>[1],
): Promise<APIResponse> {
    const token = await page.evaluate(
        () => localStorage.getItem('user_token') || sessionStorage.getItem('user_token') || '',
    );
    const headers: Record<string, string> = {
        ...((options?.headers as Record<string, string> | undefined) || {}),
    };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    // GET 为安全方法，后端不校验 CSRF，无需附加 token
    if (method !== 'get') {
        headers['X-CSRF-Token'] = await getCsrfToken(page);
    }
    return page.request[method](url, { ...options, headers });
}

export const TEST_USERS = {
    user1: {
        account: '13800138001',
        password: 'user123456',
        nickname: '萌宠小达人',
    },
    user2: {
        account: '13800138002',
        password: 'user123456',
        nickname: '铲屎官小王',
    },
} as const;

export const ADMIN_USERS = {
    super: { username: 'admin', password: 'admin123' },
    content: { username: 'content_admin', password: 'admin123' },
    data: { username: 'data_admin', password: 'admin123' },
    service: { username: 'service', password: 'admin123' },
} as const;

/** 等待 toast 出现并断言其文本 */
export async function expectToast(page: import('@playwright/test').Page, text: string | RegExp, timeout = 5_000) {
    const toast = page.locator('text=' + (typeof text === 'string' ? text : text.source)).first();
    await toast.waitFor({ state: 'visible', timeout });
}

/** 通用登录用户前台 */
export async function loginAsUser(
    page: Page,
    user: { account: string; password: string } = TEST_USERS.user1,
) {
    await page.goto('/login');
    await page.getByPlaceholder(/手机号或邮箱/).fill(user.account);
    await page.getByPlaceholder(/^请输入密码/).fill(user.password);
    await page.getByRole('button', { name: /^登录$/ }).click();
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15_000 });
}

/** 通用登录后台 */
export async function loginAsAdmin(
    page: import('@playwright/test').Page,
    admin: { username: string; password: string } = ADMIN_USERS.super,
) {
    await page.goto('/admin/login');
    await page.getByPlaceholder(/用户名|账号|username/i).first().fill(admin.username);
    await page.getByPlaceholder(/密码|password/i).first().fill(admin.password);
    await page.getByRole('button', { name: /登录/ }).click();
    await page.waitForURL((url) => !url.pathname.includes('/admin/login'), { timeout: 15_000 });
}

/** 登出并清理 localStorage */
export async function clearAuth(page: Page) {
    await page.context().clearCookies();
    // about:blank 等页面无法访问 localStorage，需要先导航到应用页面
    const url = page.url();
    if (url === 'about:blank' || url === '' || url.startsWith('chrome://')) {
        await page.goto('/', { waitUntil: 'commit' });
    }
    await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
    });
}

/**
 * 创建一对独立登录的前台会话，用于跨账号场景验证。
 *
 * actor 会话执行动作（如点赞/评论/关注/拉黑），viewer 会话验证效果（如通知/可见性变化）。
 * 两个会话使用独立 BrowserContext（cookie + localStorage 隔离），互不串味。
 *
 * 用法（注意用 `browser` fixture 而非 `page` fixture）：
 *   test('V-N4-01 - 关注通知生成', async ({ browser }) => {
 *     const { actor, viewer, cleanup } = await dualSessions(browser);
 *     try {
 *       // actor 关注 viewer ...
 *       // viewer 查看通知 ...
 *     } finally {
 *       await cleanup();
 *     }
 *   });
 *
 * @param browser Playwright `browser` fixture（test 的 browser 参数，非 page）
 * @param actorUser 操作方账号，默认 user1
 * @param viewerUser 验证方账号，默认 user2
 * @returns { actor, viewer, cleanup } cleanup 关闭两个 context，建议放 finally
 */
export async function dualSessions(
    browser: import('@playwright/test').Browser,
    actorUser: { account: string; password: string } = TEST_USERS.user1,
    viewerUser: { account: string; password: string } = TEST_USERS.user2,
): Promise<{
    actor: import('@playwright/test').Page;
    viewer: import('@playwright/test').Page;
    cleanup: () => Promise<void>;
}> {
    const actorCtx = await browser.newContext();
    const viewerCtx = await browser.newContext();
    const actor = await actorCtx.newPage();
    const viewer = await viewerCtx.newPage();

    // 串行登录，避免并行打登录接口触发限流/偶发失败
    await loginAsUser(actor, actorUser);
    await loginAsUser(viewer, viewerUser);

    return {
        actor,
        viewer,
        cleanup: async () => {
            await actorCtx.close();
            await viewerCtx.close();
        },
    };
}
