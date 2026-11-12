/**
 * Phase6 增量功能与聊天 UI 覆盖（优先级②补齐）。
 *
 * 这些能力在 docs/roadmap.md 已收口、在 docs/specs 已勾选 [x]，
 * 但此前缺 E2E 真实断言（或被 front/e2e/README.md、docs/specs/e2e-coverage-audit.md
 * 误判为「前端无 UI」）。本文件补上接口层 / UI 层断言，纠正「能力上线却永久漏测」。
 *
 * 覆盖：
 *  - R5  宠物可见范围越权（私密宠物对非主人返回 404）
 *  - R2  寻宠分享面板（微信 / 复制链接 / 二维码）
 *  - M3  私信图片消息入口（选择图片按钮）
 *  - M4  私信语音消息入口（开始录音按钮，MediaRecorder）
 *  - M8  聊天记录搜索入口（搜索消息 → 搜索聊天记录输入框）
 *
 * 说明：R11 我的举报页已改由 V-F8-01（/profile → 我的举报 → /my-reports）覆盖，不再重复。
 */
import { test, expect, type Page, type Browser } from '@playwright/test';
import { apiWrite, dualSessions, loginAsUser } from './fixtures/auth';

/**
 * 以当前登录用户通过 UI 表单创建一只宠物，返回宠物 ID（R5 越权用例复用）。
 * 走 UI 而非裸接口：接口字段较多、visibility 语义依赖表单 RadioGroup，UI 路径已被
 * V-P1-02 验证稳定；visibilityLabel 取 PetVisibilityOptions 文案（如「仅自己可见」）。
 */
async function createPet(page: Page, visibilityLabel: string): Promise<number> {
    await page.goto('/pets/create');
    await page.getByPlaceholder('给你的毛孩子起个名字吧').fill(`e2e私密宠物_${Date.now()}`);

    const visGroup = page.locator('[aria-label="宠物可见范围"]');
    await expect(visGroup).toBeVisible({ timeout: 10_000 });
    // React Aria / HeroUI 的 radio 真实控件是隐藏 input，可见的是 label 卡片，
    // 直接 click input 会被 label 挡住；改为点击可见的文案（value=2 → 仅自己可见）。
    await visGroup.getByText(visibilityLabel, { exact: true }).click();

    const respPromise = page.waitForResponse(
        (r) => r.url().includes('/api/v1/pets') && r.request().method() === 'POST',
        { timeout: 15_000 },
    );
    await page.getByRole('button', { name: '创建档案' }).click();
    const resp = await respPromise;
    expect(resp.ok(), `创建宠物失败: ${resp.status()}`).toBeTruthy();

    await page.waitForURL(/\/pets\/\d+/, { timeout: 10_000 });
    const m = page.url().match(/\/pets\/(\d+)/);
    const id = Number(m?.[1] ?? 0);
    expect(id, '创建宠物后未跳转到宠物详情页').toBeGreaterThan(0);
    return id;
}

test.describe('R5 - 宠物可见范围越权', () => {
    test('R5 - 私密宠物对非主人返回 404', async ({ browser }: { browser: Browser }) => {
        const { actor, viewer, cleanup } = await dualSessions(browser);
        try {
            // actor 创建一只「私密（仅自己可见）」宠物
            const petId = await createPet(actor, '仅自己可见');
            expect(petId).toBeGreaterThan(0);

            // 主人自己能读到
            const ownerResp = await apiWrite(actor, 'get', `/api/v1/pets/${petId}`);
            expect(ownerResp.ok(), `主人读取私密宠物失败: ${ownerResp.status()}`).toBeTruthy();

            // 非主人（viewer）读取应被越权拦截：统一返回 404「宠物不存在」
            const viewerResp = await apiWrite(viewer, 'get', `/api/v1/pets/${petId}`);
            expect(viewerResp.status(), '非主人读取私密宠物应返回 404').toBe(404);
            const viewerBody = (await viewerResp.json()) as { message?: string };
            expect(viewerBody.message, '越权响应应统一为「宠物不存在」').toContain('宠物不存在');
        } finally {
            await cleanup();
        }
    });
});

test.describe('R2 - 寻宠分享面板', () => {
    test('R2 - 寻宠详情点击分享弹出分享面板', async ({ page }: { page: Page }) => {
        await loginAsUser(page);
        await page.goto('/lost-pets');
        await page.waitForTimeout(1_500);

        // 取第一条寻宠启事详情（排除「发布寻宠」创建入口 /lost-pets/create）
        const links = page.locator('a[href^="/lost-pets/"]');
        const n = await links.count();
        let firstCard: ReturnType<typeof page.locator> | null = null;
        for (let i = 0; i < n; i++) {
            const href = await links.nth(i).getAttribute('href');
            if (href && /^\/lost-pets\/\d+$/.test(href)) {
                firstCard = links.nth(i);
                break;
            }
        }
        test.skip(!firstCard, '暂无止宠启事数据');

        await (firstCard as ReturnType<typeof page.locator>).click();
        await expect(page).toHaveURL(/\/lost-pets\/\d+/, { timeout: 10_000 });

        // 分享入口：aria-label="分享寻宠启事"
        const shareBtn = page.getByRole('button', { name: '分享寻宠启事' });
        await expect(shareBtn).toBeVisible({ timeout: 10_000 });
        await shareBtn.click();

        // 分享面板（ShareSheet）含微信 / 复制链接 / 二维码 等平台（R3 海报需传素材才显示）
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible({ timeout: 5_000 });
        await expect(dialog).toContainText(/微信|复制链接|二维码/, { timeout: 5_000 });
    });
});

test.describe('M3/M4/M8 - 私信图片 / 语音 / 聊天搜索入口', () => {
    test('M3/M4 - 进入会话后输入区含「选择图片」「开始录音」', async ({
        browser,
    }: {
        browser: Browser;
    }) => {
        const { actor, viewer, cleanup } = await dualSessions(browser);
        try {
            // actor 给 viewer 发一条消息，建立会话
            const sendRes = await apiWrite(actor, 'post', '/api/v1/social/messages/send', {
                data: { toId: 2, content: `e2e会话入口_${Date.now()}`, type: 'text' },
            });
            expect(sendRes.ok(), `发送私信失败: ${sendRes.status()}`).toBeTruthy();

            await viewer.goto('/messages');
            const conv = viewer.locator('a[href^="/messages/"]').first();
            test.skip((await conv.count()) === 0, '消息列表为空');
            await conv.click();
            await expect(viewer).toHaveURL(/\/messages\/\d+\/\d+/, { timeout: 10_000 });

            // M3：图片消息入口
            await expect(
                viewer.getByRole('button', { name: '选择图片' }),
                '图片消息入口应可见',
            ).toBeVisible({ timeout: 10_000 });
            // M4：语音消息入口（MediaRecorder 录音按钮）
            await expect(
                viewer.getByRole('button', { name: '开始录音' }),
                '语音消息入口应可见',
            ).toBeVisible({ timeout: 10_000 });
        } finally {
            await cleanup();
        }
    });

    test('M8 - 聊天记录搜索入口可展开搜索框', async ({ browser }: { browser: Browser }) => {
        const { actor, viewer, cleanup } = await dualSessions(browser);
        try {
            const sendRes = await apiWrite(actor, 'post', '/api/v1/social/messages/send', {
                data: { toId: 2, content: `e2e搜索入口_${Date.now()}`, type: 'text' },
            });
            expect(sendRes.ok(), `发送私信失败: ${sendRes.status()}`).toBeTruthy();

            await viewer.goto('/messages');
            const conv = viewer.locator('a[href^="/messages/"]').first();
            test.skip((await conv.count()) === 0, '消息列表为空');
            await conv.click();
            await expect(viewer).toHaveURL(/\/messages\/\d+\/\d+/, { timeout: 10_000 });

            // 点击「搜索消息」展开内联搜索条
            await viewer.getByRole('button', { name: '搜索消息' }).click();
            const searchInput = viewer.getByPlaceholder('搜索聊天记录');
            await expect(searchInput, '聊天记录搜索框应出现').toBeVisible({ timeout: 5_000 });
            await searchInput.fill('e2e');
            await expect(searchInput).toHaveValue('e2e');
        } finally {
            await cleanup();
        }
    });
});
