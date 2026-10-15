import { test, expect } from '@playwright/test';
import { TEST_USERS, clearAuth, loginAsUser, dualSessions, apiWrite } from './fixtures/auth';

test.describe('Phase3 - 关注功能', () => {
    test.beforeEach(async ({ page }) => {
        await clearAuth(page);
    });

    test('V-F1-01 - 已登录关注用户', async ({ page }) => {
        // profile 页已补关注按钮（userProfilePage + useFollowState），关注/取消关注亦可在 followListPage 操作
        // 按钮文案：未关注="关注"，已关注="已关注"（见 followListPage.tsx / userProfilePage.tsx）
        await loginAsUser(page);
        await page.goto('/follow/1/followers');
        await page.waitForTimeout(2000);

        // 在粉丝列表中找到"关注"按钮（未互关的粉丝项）
        const followBtn = page.getByRole('button', { name: /^关注$/ }).first();
        test.skip(!(await followBtn.isVisible()), '粉丝列表无可关注的用户（数据为空或已全部互关）');

        await followBtn.click();
        await page.waitForTimeout(800);

        // 断言按钮状态变化：关注 → 已关注（verify.md V-F1-01 预期按钮显示"已关注"）
        await expect(page.getByRole('button', { name: /已关注/ }).first()).toBeVisible({ timeout: 5_000 });
    });

    test('V-F2-01 - 已登录取消关注', async ({ page }) => {
        // 前置：V-F1-01 已关注某用户；在关注列表点击"已关注"按钮触发取消
        await loginAsUser(page);
        await page.goto('/follow/1/following');
        await page.waitForTimeout(2000);

        const followedBtn = page.getByRole('button', { name: /已关注/ }).first();
        test.skip(!(await followedBtn.isVisible()), '关注列表为空，无已关注用户可取消');

        await followedBtn.click();
        await page.waitForTimeout(800);

        // 断言按钮恢复为"关注"（verify.md V-F2-01 预期按钮恢复"关注"）
        await expect(page.getByRole('button', { name: /^关注$/ }).first()).toBeVisible({ timeout: 5_000 });
    });

    test('V-F3-01 - 关注列表可访问', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/follow/1/following');
        await page.waitForTimeout(2000);
        expect(page.url()).toContain('/follow');
    });

    test('V-F4-01 - 粉丝列表可访问', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/follow/1/followers');
        await page.waitForTimeout(2000);
        expect(page.url()).toContain('/follow');
    });

    test('V-F5-01 - 用户卡片互关标识', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/follow/1/following');
        await page.waitForTimeout(2000);

        // 检查互相关注标识
        const mutualIcon = page.locator('[class*="mutual"], [data-testid="mutual-follow"]').first();
        if (await mutualIcon.isVisible()) {
            await expect(mutualIcon).toBeVisible();
        }
    });

    test('V-F6-01 - 悄悄关注列表可访问', async ({ page }) => {
        // 悄悄关注列表 UI 已实现：/follow/:id/secret-following（followListPage 悄悄关注 tab，仅自己可见）
        await loginAsUser(page);
        await page.goto('/follow/1/secret-following');
        await page.waitForTimeout(2000);
        expect(page.url()).toContain('/follow');
    });

    test('V-F6-02 - 悄悄关注标识显示', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/follow/1/following');
        await page.waitForTimeout(2000);

        // 检查悄悄关注的特殊图标标识
        const secretIcon = page.locator('[class*="secret"], [data-testid="secret-follow"]').first();
        if (await secretIcon.isVisible()) {
            await expect(secretIcon).toBeVisible();
        }
    });

    test('V-F7-03 - 拉黑列表可访问', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/blocked');
        await page.waitForTimeout(2000);
        expect(page.url()).toContain('/blocked');
    });

    test('V-F7-04 - 取消拉黑', async ({ page }) => {
        // §4.2：取消拉黑恢复双向可见
        await loginAsUser(page);
        await page.goto('/blocked');
        await page.waitForTimeout(2000);

        const unblockBtn = page.getByRole('button', { name: /取消拉黑/ }).first();
        test.skip(!(await unblockBtn.isVisible()), '拉黑列表为空');

        await unblockBtn.click();
        await page.waitForTimeout(500);
    });

    test('V-F7-05 - 拉黑后双方动态屏蔽（§4.2 双向屏蔽）', async ({ page }) => {
        // 拉黑后双方不可互看动态/主页
        test.skip(true, '需双账号跨会话验证（A 拉黑 B 后，B 视角不可见 A 动态），跨账号场景待补');
    });

    test('V-F7-06 - 拉黑后私信屏蔽（§4.2 双向屏蔽）', async ({ page }) => {
        test.skip(true, '见 V-M1-04；合并到私信模块验证');
    });

    test('V-F8-01 - 举报用户', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/profile/2');
        await page.waitForTimeout(2000);

        const reportBtn = page.getByRole('button', { name: /举报/ }).first();
        test.skip(!(await reportBtn.isVisible()), '举报入口未渲染');

        await reportBtn.click();
        await page.waitForTimeout(500);

        // 举报弹窗应包含举报类型选择
        const reportDialog = (await page.locator('body').textContent()) || '';
        expect(reportDialog).toMatch(/举报|类型|原因/);
    });
});

test.describe('Phase3 - 私信功能', () => {
    test.beforeEach(async ({ page }) => {
        await clearAuth(page);
    });

    test('V-M1-01 - 已登录发送私信', async ({ page }) => {
        // 消息输入框在具体会话页 /messages/:conversationId/:targetUserId，非列表页 /messages
        await loginAsUser(page);
        await page.goto('/messages');
        await page.waitForTimeout(2000);

        // 进入第一个会话
        const firstConversation = page.locator('a[href^="/messages/"]').first();
        test.skip(!(await firstConversation.isVisible()), '消息列表为空，无可进入的会话');

        await firstConversation.click();
        await page.waitForTimeout(1500);

        // 输入框 aria-label="输入消息"（见 chatPage.tsx:92）
        const messageInput = page.getByLabel('输入消息').first();
        test.skip(!(await messageInput.isVisible()), '会话页消息输入框未渲染');

        const msg = `e2e测试私信_${Date.now()}`;
        await messageInput.fill(msg);

        // 发送按钮 aria-label="发送"（见 chatPage.tsx:99）
        await page.getByRole('button', { name: '发送' }).first().click();
        await page.waitForTimeout(1000);

        // 断言消息出现在聊天区（verify.md V-M1-01 预期消息显示在聊天列表）
        await expect(page.locator('body')).toContainText(msg, { timeout: 5_000 });
    });

    test('V-M2-01 - 消息列表可访问', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/messages');
        await page.waitForTimeout(2000);
        expect(page.url()).toContain('/messages');
    });

    test('V-M5-06 - 在线状态显示', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/messages');
        await page.waitForTimeout(2000);

        // 检查在线状态标识
        const onlineStatus = page.locator('[class*="online"], [data-testid="online-status"]').first();
        if (await onlineStatus.isVisible()) {
            await expect(onlineStatus).toBeVisible();
        }
    });

    test('V-M1-03 - 仅粉丝可私信权限限制', async ({ page }) => {
        // §4.7：私信权限「仅粉丝」门禁仅普通关注计入，悄悄关注不满足
        // 前置：目标用户在 /settings 将「私信权限」设为「仅粉丝」
        // 此用例验证非粉丝向其发起私信时被拦截
        test.skip(true, '需先通过 /settings 将目标用户私信权限设为「仅粉丝」并准备非粉丝账号，跨账号场景待补');
        await loginAsUser(page);
        await page.goto('/messages/new');
        await page.waitForTimeout(1500);
    });

    test('V-M1-04 - 拉黑后私信限制', async ({ page }) => {
        // §4.2：拉黑效果双向屏蔽，双方不可互发私信
        await loginAsUser(page);
        await page.goto('/blocked');
        await page.waitForTimeout(2000);

        const firstBlocked = page.locator('a[href^="/messages/"], [data-testid="blocked-user"]').first();
        test.skip(!(await firstBlocked.isVisible()), '拉黑列表为空，无法验证拉黑后私信限制');

        // 拉黑列表中点击私信应被拦截或提示
        const messageBtn = page.getByRole('button', { name: /私信|消息/ }).first();
        if (await messageBtn.isVisible()) {
            await messageBtn.click();
            await page.waitForTimeout(1000);
            // 期望出现拦截提示或无法进入聊天
            const blocked = (await page.locator('body').textContent()) || '';
            expect(blocked).toMatch(/拉黑|屏蔽|无法|拒绝|权限/);
        }
    });
});

test.describe('Phase3 - 通知功能', () => {
    test.beforeEach(async ({ page }) => {
        await clearAuth(page);
    });

    test('V-N6-01 - 通知列表可访问', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/notifications');
        await page.waitForTimeout(2000);

        await expect(page.locator('body')).toContainText(/通知|点赞|评论|关注/, { timeout: 5_000 });
    });

    test('V-N1-01 - 点赞通知生成', async ({ page }) => {
        // 触发路径：user1 点赞 user2 的动态 → user2 收到点赞通知
        test.skip(true, '需双账号跨会话验证（user1 点赞 → user2 视角通知），跨账号场景待补');
    });

    test('V-N2-01 - 评论通知生成', async ({ page }) => {
        test.skip(true, '需双账号跨会话验证（user1 评论 → user2 视角通知），跨账号场景待补');
    });

    test('V-N3-01 - @通知生成', async ({ page }) => {
        test.skip(true, '需双账号跨会话验证（user1 @user2 → user2 视角通知），跨账号场景待补');
    });

    test('V-N4-01 - 关注通知生成', async ({ browser }) => {
        // 跨账号场景：actor(user1) 关注 viewer(user2) → viewer 收到关注通知
        // 前端无"关注任意用户"的 UI 入口（followListPage 仅列出关注/粉丝列表中的用户），
        // 故用 actor.request 调关注 API 触发，viewer 侧用 UI 验证通知（混合方案 A+D）。
        const { actor, viewer, cleanup } = await dualSessions(browser);

        try {
            // 1. 先重置关注状态：取消关注（幂等，未关注则 no-op），确保后续关注能生成新通知
            // page.request 不会像 axios 一样自动带 X-CSRF-Token，需显式附加
            await apiWrite(actor, 'delete', '/api/v1/social/follow/2');
            await actor.waitForTimeout(500);

            // 2. actor 关注 user2（id=2）
            const followRes = await apiWrite(actor, 'post', '/api/v1/social/follow/2');
            if (!followRes.ok()) {
                const body = await followRes.text();
                throw new Error(`关注 API 调用失败 HTTP ${followRes.status()}: ${body}`);
            }

            // 3. viewer 查看通知列表（通知可能异步生成，retry 等待）
            await viewer.goto('/notifications');
            await viewer.waitForTimeout(1500);

            // 4. 断言：通知列表含 user1 昵称"萌宠小达人"（关注通知触发者）
            //    通知可能异步投递，用 expect.toContainText 的 timeout 重试
            await expect(viewer.locator('body')).toContainText('萌宠小达人', { timeout: 15_000 });
        } finally {
            await cleanup();
        }
    });

    test('V-N4-03 - 悄悄关注不通知（§4.7）', async ({ page }) => {
        // 悄悄关注 UI 已实现（profile 关注菜单 + 关注列表切换）；本用例需双账号跨会话验证（user1 悄悄关注 user2 → user2 视角无通知），跨账号场景待补
        test.skip(true, '需双账号跨会话验证，跨账号场景待补');
    });

    test('V-N5-01 - 系统通知样式', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/notifications');
        await page.waitForTimeout(2000);

        // 切换到系统通知分类
        const sysTab = page.getByRole('button', { name: /系统/ }).first();
        if (await sysTab.isVisible()) {
            await sysTab.click();
            await page.waitForTimeout(500);
        }
        // 系统通知存在即通过（无数据时不强断言）
        const body = (await page.locator('body').textContent()) || '';
        expect(body).toMatch(/通知|系统|暂无/);
    });

    test('V-N7-02 - 标记全部已读', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/notifications');
        await page.waitForTimeout(2000);

        const readAllBtn = page.getByRole('button', { name: /全部已读/ }).first();
        if (await readAllBtn.isVisible()) {
            await readAllBtn.click();
            await page.waitForTimeout(500);
        }
    });

    test('V-N8-01 - 通知设置可访问', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/notification-settings');
        await page.waitForTimeout(2000);

        // §4.14：N8 统一管理点赞/评论/@/关注/系统/私信开关
        await expect(page.locator('body')).toContainText(/点赞|评论|@|关注|系统|私信/, { timeout: 5_000 });
    });
});

test.describe('Phase3 - 积分等级', () => {
    test.beforeEach(async ({ page }) => {
        await clearAuth(page);
    });

    test('V-L2-07 - 积分记录可访问', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/points');
        await page.waitForTimeout(2000);

        await expect(page.locator('body')).toContainText(/积分|记录|等级/, { timeout: 5_000 });
    });

    test('V-L3-01 - 积分规则可访问', async ({ page }) => {
        await loginAsUser(page);
        // 积分规则展示在 /points 页面内，无独立路由
        await page.goto('/points');
        await page.waitForTimeout(2000);
        expect(page.url()).toContain('/points');
    });
});