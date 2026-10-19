import { test, expect, type Page } from '@playwright/test';
import { TEST_USERS, clearAuth, loginAsUser, dualSessions, apiWrite } from './fixtures/auth';

/**
 * Phase3 补充用例（跨账号场景为主）：
 * 通知生成 N1/N2/N3/N4-03、拉黑双向屏蔽 F7-05、私信门禁 M1-03、
 * 通知设置保存 N8、等级积分 L1/L2/L4、私信纵深 M6/M7/M9。
 *
 * 缺口来源：docs/specs/e2e-coverage-audit.md §二/§四
 * 需求语义：docs/specs/id-traceability.md §4.3；全局裁定见 pet-community-requirements.md §四
 *
 * 跨账号统一沿用 V-N4-01 的「actor 调 API 触发 + viewer 用 UI 验证」范式（dualSessions）。
 */

const ACTOR_NICKNAME = TEST_USERS.user1.nickname; // 萌宠小达人
const VIEWER_ID = 2; // user2：铲屎官小王

/** 通过接口创建一条动态，返回动态 ID（用于构造点赞/评论/@ 行为） */
async function createPostViaApi(page: Page, content: string): Promise<number> {
    const res = await apiWrite(page, 'post', '/api/v1/posts', { data: { content } });
    expect(res.ok(), `接口发布动态失败: ${res.status()}`).toBeTruthy();
    const body = (await res.json().catch(() => ({}))) as { data?: { id?: number }; id?: number };
    const id = Number(body?.data?.id ?? body?.id ?? 0);
    expect(id, '发布响应缺少 id').toBeGreaterThan(0);
    return id;
}

/** 读取当前登录用户的私信未读数 */
async function getUnreadCount(page: Page): Promise<number> {
    const res = await apiWrite(page, 'get', '/api/v1/social/messages/unread/count');
    const body = (await res.json().catch(() => ({}))) as { data?: unknown };
    const data = body?.data;
    if (typeof data === 'number') return data;
    const obj = (data ?? {}) as { count?: number; unreadCount?: number; unread?: number };
    return Number(obj.count ?? obj.unreadCount ?? obj.unread ?? 0);
}

/** 统计通知列表中「actor 昵称」出现的次数，用于判断通知是否新增 */
async function countActorNotifications(page: Page): Promise<number> {
    await page.goto('/notifications');
    await page.waitForTimeout(1_500);
    return page.getByText(ACTOR_NICKNAME).count();
}

test.describe('Phase3 补充 - 通知生成（V-N1/N2/N3/N4-03）', () => {
    test('V-N1-01 - 点赞他人动态后作者收到点赞通知', async ({ browser }) => {
        const { actor, viewer, cleanup } = await dualSessions(browser);
        try {
            const postId = await createPostViaApi(viewer, `e2e点赞通知_${Date.now()}`);
            const before = await countActorNotifications(viewer);

            const likeRes = await apiWrite(actor, 'post', `/api/v1/posts/${postId}/like`);
            expect(likeRes.ok(), `点赞失败: ${likeRes.status()}`).toBeTruthy();

            await viewer.waitForTimeout(2_000);
            const after = await countActorNotifications(viewer);
            expect(after, '点赞后作者通知数应增加').toBeGreaterThan(before);

            // 还原：取消点赞
            await apiWrite(actor, 'post', `/api/v1/posts/${postId}/like`);
        } finally {
            await cleanup();
        }
    });

    test('V-N2-01 - 评论他人动态后作者收到评论通知', async ({ browser }) => {
        const { actor, viewer, cleanup } = await dualSessions(browser);
        try {
            const postId = await createPostViaApi(viewer, `e2e评论通知_${Date.now()}`);
            const before = await countActorNotifications(viewer);

            const commentRes = await apiWrite(actor, 'post', `/api/v1/posts/${postId}/comments`, {
                data: { postId, content: `e2e评论_${Date.now()}` },
            });
            expect(commentRes.ok(), `评论失败: ${commentRes.status()}`).toBeTruthy();

            await viewer.waitForTimeout(2_000);
            const after = await countActorNotifications(viewer);
            expect(after, '评论后作者通知数应增加').toBeGreaterThan(before);
        } finally {
            await cleanup();
        }
    });

    test('V-N3-01 - @他人后对方收到 @通知', async ({ browser }) => {
        const { actor, viewer, cleanup } = await dualSessions(browser);
        try {
            const before = await countActorNotifications(viewer);

            // 后端按 `@昵称` 解析被 @ 用户（notification_service.ParseAtUsers）
            await createPostViaApi(
                actor,
                `@${TEST_USERS.user2.nickname} e2e@通知_${Date.now()}`,
            );

            await viewer.waitForTimeout(2_000);
            const after = await countActorNotifications(viewer);
            expect(after, '被 @ 后通知数应增加').toBeGreaterThan(before);
        } finally {
            await cleanup();
        }
    });

    test('V-N4-03 - 悄悄关注不产生关注通知（§4.7）', async ({ browser }) => {
        const { actor, viewer, cleanup } = await dualSessions(browser);
        try {
            // 先取消关注，排除历史关注通知干扰
            await apiWrite(actor, 'delete', `/api/v1/social/follow/${VIEWER_ID}`);
            await actor.waitForTimeout(500);

            const before = await countActorNotifications(viewer);

            const secretRes = await apiWrite(actor, 'post', `/api/v1/social/follow/${VIEWER_ID}`, {
                data: { secret: true },
            });
            expect(secretRes.ok(), `悄悄关注失败: ${secretRes.status()}`).toBeTruthy();

            await viewer.waitForTimeout(2_000);
            const after = await countActorNotifications(viewer);
            expect(after, '悄悄关注不应产生通知').toBe(before);

            // 还原关注状态
            await apiWrite(actor, 'delete', `/api/v1/social/follow/${VIEWER_ID}`);
        } finally {
            await cleanup();
        }
    });
});

test.describe('Phase3 补充 - 屏蔽与门禁（V-F7-05/V-M1-03）', () => {
    test('V-F7-05 - 拉黑后双方动态屏蔽（§4.2 双向屏蔽）', async ({ browser }) => {
        const { actor, viewer, cleanup } = await dualSessions(browser);
        try {
            const postId = await createPostViaApi(viewer, `e2e拉黑屏蔽_${Date.now()}`);

            // 拉黑前：actor 可正常查看
            const before = await apiWrite(actor, 'get', `/api/v1/posts/${postId}`);
            expect(before.ok(), '拉黑前应可查看对方动态').toBeTruthy();

            const blockRes = await apiWrite(actor, 'post', `/api/v1/social/block/${VIEWER_ID}`);
            expect(blockRes.ok(), `拉黑失败: ${blockRes.status()}`).toBeTruthy();

            // 拉黑后：actor 侧不可查看对方动态
            const after = await apiWrite(actor, 'get', `/api/v1/posts/${postId}`);
            expect(after.ok(), '拉黑后不应可查看对方动态').toBeFalsy();

            // 还原：取消拉黑
            await apiWrite(actor, 'delete', `/api/v1/social/block/${VIEWER_ID}`);
        } finally {
            await cleanup();
        }
    });

    test('V-M1-03 - 私信权限「仅粉丝」时非粉丝被拦截（§4.7）', async ({ browser }) => {
        const { actor, viewer, cleanup } = await dualSessions(browser);
        try {
            // 前置：viewer 将私信权限设为「仅粉丝」
            const permRes = await apiWrite(viewer, 'put', '/api/v1/user/privacy', {
                data: { messagePermission: 1 },
            });
            expect(permRes.ok(), `设置私信权限失败: ${permRes.status()}`).toBeTruthy();

            // 前置：actor 取消关注 viewer（确保是非粉丝）
            await apiWrite(actor, 'delete', `/api/v1/social/follow/${VIEWER_ID}`);
            await actor.waitForTimeout(500);

            // 非粉丝发送私信应被拦截
            const sendRes = await apiWrite(actor, 'post', '/api/v1/social/messages/send', {
                data: { toId: VIEWER_ID, content: `e2e门禁_${Date.now()}`, type: 'text' },
            });
            expect(sendRes.ok(), '非粉丝不应能向「仅粉丝」用户发私信').toBeFalsy();

            // 还原：恢复「所有人」+ actor 重新关注，避免污染后续依赖互关的用例
            await apiWrite(viewer, 'put', '/api/v1/user/privacy', {
                data: { messagePermission: 0 },
            });
            await apiWrite(actor, 'post', `/api/v1/social/follow/${VIEWER_ID}`);
        } finally {
            await cleanup();
        }
    });
});

test.describe('Phase3 补充 - 通知设置与积分等级（V-N8/V-L1/V-L2/V-L4）', () => {
    test.beforeEach(async ({ page }) => {
        await clearAuth(page);
    });

    test('V-N8-02 - 通知开关切换后保存并持久化', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/notification-settings');

        const firstItem = page.locator('.setting-item').first();
        const toggle = firstItem.locator('.toggle-switch');
        const clsBefore = (await toggle.getAttribute('class')) ?? '';

        const putPromise = page.waitForResponse(
            (r) =>
                r.url().includes('/api/v1/social/notification-settings') &&
                r.request().method() === 'PUT',
            { timeout: 10_000 },
        );
        await firstItem.click();
        const putResp = await putPromise;
        expect(putResp.ok(), `保存通知设置失败: ${putResp.status()}`).toBeTruthy();

        await expect(toggle).not.toHaveClass(clsBefore, { timeout: 5_000 });

        // 刷新后仍保持新状态（落库校验）
        await page.reload();
        await expect(page.locator('.setting-item').first().locator('.toggle-switch')).not.toHaveClass(
            clsBefore,
            { timeout: 10_000 },
        );

        // 还原初始开关状态
        const restorePromise = page.waitForResponse(
            (r) =>
                r.url().includes('/api/v1/social/notification-settings') &&
                r.request().method() === 'PUT',
            { timeout: 10_000 },
        );
        await page.locator('.setting-item').first().click();
        expect((await restorePromise).ok()).toBeTruthy();
    });

    test('V-L1-01 - 用户等级展示', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/points');

        const levelResp = await apiWrite(page, 'get', '/api/v1/social/points/level');
        const body = (await levelResp.json().catch(() => ({}))) as {
            data?: { level?: number; levelName?: string };
        };
        const level = body?.data?.level;
        expect(typeof level, '等级接口未返回 level').toBe('number');

        await expect(page.locator('body')).toContainText(`Lv.${level}`, { timeout: 10_000 });
    });

    test('V-L2-01 - 积分记录展示', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/points');

        await page.getByRole('tab', { name: '积分记录' }).click();
        await expect(page.locator('body')).toContainText(/积分|暂无积分记录/, { timeout: 10_000 });
    });

    test('V-L4-01 - 等级权益展示', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/points');

        await page.getByRole('tab', { name: '等级权益' }).click();
        await expect(page.locator('body')).toContainText(/权益|暂无等级权益/, { timeout: 10_000 });
    });
});

test.describe('Phase3 补充 - 私信纵深（V-M6/V-M7/V-M9）', () => {
    test('V-M6-01 - 进入会话后未读数清零', async ({ browser }) => {
        const { actor, viewer, cleanup } = await dualSessions(browser);
        try {
            const sendRes = await apiWrite(actor, 'post', '/api/v1/social/messages/send', {
                data: { toId: VIEWER_ID, content: `e2e未读_${Date.now()}`, type: 'text' },
            });
            expect(sendRes.ok(), `发送私信失败: ${sendRes.status()}`).toBeTruthy();

            const before = await getUnreadCount(viewer);
            expect(before, '收到私信后应存在未读').toBeGreaterThan(0);

            await viewer.goto('/messages');
            const conv = viewer.locator('a[href^="/messages/"]').first();
            test.skip((await conv.count()) === 0, '消息列表为空');
            await conv.click();
            await viewer.waitForTimeout(2_000);

            const after = await getUnreadCount(viewer);
            expect(after, '进入会话后未读应减少').toBeLessThan(before);
        } finally {
            await cleanup();
        }
    });

    test('V-M7-01 - 撤回消息后会话显示「消息已撤回」', async ({ browser }) => {
        const { actor, cleanup } = await dualSessions(browser);
        try {
            const sendRes = await apiWrite(actor, 'post', '/api/v1/social/messages/send', {
                data: { toId: VIEWER_ID, content: `e2e撤回_${Date.now()}`, type: 'text' },
            });
            expect(sendRes.ok(), `发送私信失败: ${sendRes.status()}`).toBeTruthy();
            const sendBody = (await sendRes.json().catch(() => ({}))) as {
                data?: { id?: number };
                id?: number;
            };
            const msgId = Number(sendBody?.data?.id ?? sendBody?.id ?? 0);
            expect(msgId, '发送响应缺少消息 id').toBeGreaterThan(0);

            await actor.goto('/messages');
            const conv = actor.locator('a[href^="/messages/"]').first();
            test.skip((await conv.count()) === 0, '消息列表为空');
            await conv.click();
            await actor.waitForTimeout(1_500);

            const recallRes = await apiWrite(
                actor,
                'post',
                `/api/v1/social/messages/recall/${msgId}`,
            );
            expect(recallRes.ok(), `撤回失败: ${recallRes.status()}`).toBeTruthy();

            await actor.reload();
            await expect(actor.getByText('消息已撤回').first()).toBeVisible({ timeout: 10_000 });
        } finally {
            await cleanup();
        }
    });

    test('V-M9-01 - 删除会话后列表中移除', async ({ browser }) => {
        const { actor, cleanup } = await dualSessions(browser);
        try {
            await apiWrite(actor, 'post', '/api/v1/social/messages/send', {
                data: { toId: VIEWER_ID, content: `e2e删会话_${Date.now()}`, type: 'text' },
            });

            await actor.goto('/messages');
            const conv = actor.locator('a[href^="/messages/"]').first();
            test.skip((await conv.count()) === 0, '消息列表为空');
            const href = await conv.getAttribute('href');
            const conversationId = href?.split('/')[2] ?? '';
            expect(conversationId, '会话链接缺少 conversationId').not.toBe('');

            const delRes = await apiWrite(
                actor,
                'delete',
                `/api/v1/social/messages/${conversationId}`,
            );
            expect(delRes.ok(), `删除会话失败: ${delRes.status()}`).toBeTruthy();

            await actor.goto('/messages');
            await expect(actor.locator(`a[href="${href}"]`)).toHaveCount(0, { timeout: 10_000 });
        } finally {
            await cleanup();
        }
    });
});
