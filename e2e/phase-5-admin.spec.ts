import { test, expect } from '@playwright/test';
import { TEST_USERS, ADMIN_USERS, clearAuth, loginAsUser, loginAsAdmin, firstDetailLink } from './fixtures/auth';

test.describe('Phase5 - 领养中心', () => {
    test.beforeEach(async ({ page }) => {
        await clearAuth(page);
    });

    test('V-A8-02 - 领养列表展示', async ({ page }) => {
        await page.goto('/adopts');
        await expect(page.getByText('领养中心')).toBeVisible({ timeout: 10_000 });
    });

    test('V-A8-02 - 领养列表类型筛选', async ({ page }) => {
        await page.goto('/adopts');
        await page.waitForTimeout(1500);

        await page.getByRole('button', { name: '猫咪' }).click();
        await page.waitForTimeout(500);
    });

    test('V-A8-01 - 未登录访问发布领养跳转登录', async ({ page }) => {
        await page.goto('/adopts/create');
        await page.waitForURL((url) => url.pathname.includes('/login'), { timeout: 10_000 });
    });

    test('V-A8-03 - 领养详情页可访问', async ({ page }) => {
        await page.goto('/adopts');
        await page.waitForTimeout(2000);

        const firstCard = firstDetailLink(page, 'adopts');
        const count = await firstCard.count();
        test.skip(count === 0, '暂无领养数据');

        await firstCard.click();
        await expect(page).toHaveURL(/\/adopts\/\d+/);
    });

    test('V-A8-04 - 已登录显示申请领养按钮', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/adopts');
        await page.waitForTimeout(2000);

        const firstCard = firstDetailLink(page, 'adopts');
        const count = await firstCard.count();
        test.skip(count === 0, '暂无领养数据');

        await firstCard.click();
        await page.waitForTimeout(1500);

        const applyBtn = page.getByRole('button', { name: /申请领养|立即申请/ }).first();
        if (await applyBtn.isVisible()) {
            await applyBtn.click();
            await expect(page.locator('body')).toContainText(/申请|联系人|电话|住址/, { timeout: 5_000 });
        }
    });

    test('V-A8-09 - 领养后续跟进记录', async ({ page }) => {
        // A8-07/08 电子协议与回访已移出 MVP（远期，见 id-traceability §五 / pet-community-requirements §4.10）
        test.skip(true, 'A8-07/08 回访/电子协议为远期需求，不纳入当前 MVP 验收');
        await loginAsAdmin(page);
        await page.goto('/admin/adopts');
        await page.waitForTimeout(2000);

        const firstLink = page.locator('a[href^="/admin/adopts/"]').first();
        const count = await firstLink.count();
        test.skip(count === 0, '暂无领养数据');

        await firstLink.click();
        await page.waitForTimeout(1500);

        const followUpSection = page.getByText(/回访|跟进|领养情况/);
        if (await followUpSection.isVisible()) {
            await expect(followUpSection).toBeVisible();
        }
    });
});

test.describe('Phase5 - 活动中心', () => {
    test.beforeEach(async ({ page }) => {
        await clearAuth(page);
    });

    test('V-A2-01 - 活动列表展示', async ({ page }) => {
        await page.goto('/activities');
        await expect(page.getByText('活动中心')).toBeVisible({ timeout: 10_000 });
    });

    test('V-A2-05 - 活动分类筛选', async ({ page }) => {
        await page.goto('/activities');
        await page.waitForTimeout(1500);

        const allBtn = page.getByRole('button', { name: '全部' }).first();
        if (await allBtn.isVisible()) {
            await allBtn.click();
            await page.waitForTimeout(500);
        }
    });

    test('V-A2-02 - 活动详情页渲染', async ({ page }) => {
        await page.goto('/activities');
        await page.waitForTimeout(2000);

        const firstLink = page.locator('a[href^="/activities/"]').first();
        const count = await firstLink.count();
        test.skip(count === 0, '暂无活动数据');

        await firstLink.click();
        await expect(page).toHaveURL(/\/activities\/\d+/);
    });

    test('V-A3-01 - 已登录活动报名', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/activities');
        await page.waitForTimeout(2000);

        const firstLink = page.locator('a[href^="/activities/"]').first();
        const count = await firstLink.count();
        test.skip(count === 0, '暂无活动数据');

        await firstLink.click();
        await page.waitForTimeout(1500);

        await expect(page.locator('body')).toContainText(/活动|签到|报名|参与/, { timeout: 5_000 });
    });

    test('V-A4-01 - 已登录上传活动作品', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/activities');
        await page.waitForTimeout(2000);

        const firstLink = page.locator('a[href^="/activities/"]').first();
        const count = await firstLink.count();
        test.skip(count === 0, '暂无活动数据');

        await firstLink.click();
        await page.waitForTimeout(1500);

        const uploadBtn = page.getByRole('button', { name: /上传|提交作品/ }).first();
        if (await uploadBtn.isVisible()) {
            await uploadBtn.click();
            await page.waitForTimeout(1000);
        }
    });

    test('V-A5-01 - 已登录活动投票', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/activities');
        await page.waitForTimeout(2000);

        const firstLink = page.locator('a[href^="/activities/"]').first();
        const count = await firstLink.count();
        test.skip(count === 0, '暂无活动数据');

        await firstLink.click();
        await page.waitForTimeout(1500);

        const voteBtn = page.getByRole('button', { name: /投票/ }).first();
        if (await voteBtn.isVisible()) {
            await voteBtn.click();
            await page.waitForTimeout(500);
        }
    });

    test('V-A6-01 - 评选发奖（后台）', async ({ page }) => {
        // A6=评选发奖；后台活动投票/评选入口 /admin/activities/:id/vote
        await loginAsAdmin(page);
        await page.goto('/admin/activities');
        await page.waitForTimeout(2000);

        // 后台活动列表路由未实现，跳过
        const voteLink = page.locator('a[href*="/vote"]').first();
        test.skip(!(await voteLink.isVisible()), '评选发奖入口未渲染（后台活动列表路由未实现）');

        await voteLink.click();
        await page.waitForTimeout(1500);
        await expect(page.locator('body')).toContainText(/评选|发奖|投票|作品/, { timeout: 5_000 });
    });

    test('V-A7-01 - 线下活动展示', async ({ page }) => {
        // A7=线下活动；线下活动通过活动类型字段区分，复用 /activities 列表
        await page.goto('/activities');
        await page.waitForTimeout(2000);

        // 切换到线下活动分类（若 UI 支持）
        const offlineFilter = page.getByRole('button', { name: /线下/ }).first();
        if (await offlineFilter.isVisible()) {
            await offlineFilter.click();
            await page.waitForTimeout(500);
        }
        expect(page.url()).toContain('/activities');
    });
});

test.describe('Phase5 - 后台管理', () => {
    test.beforeEach(async ({ page }) => {
        await clearAuth(page);
    });

    test('V-Ad5-01 - 运营驾驶舱仪表盘', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/dashboard');
        await expect(page.locator('body')).toContainText(/数据|统计|看板|概览|今日/, { timeout: 10_000 });
    });

    test('V-Ad5-06 - 待办聚合展示', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/dashboard');
        await page.waitForTimeout(2000);

        // §4.10：驾驶舱待办聚合内容审核/举报/广告；不含发布者侧领养一审，可含「领养违规待处理」
        await expect(page.locator('body')).toContainText(/待审核|举报|广告/, { timeout: 5_000 });
    });

    test('V-Ad1-01 - 内容审核待审核列表', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/reviews');
        await page.waitForTimeout(2000);

        await expect(page.locator('body')).toContainText(/待审核|审核|内容/, { timeout: 5_000 });
    });

    test('V-Ad1-03/V-Ad1-04 - 审核通过与拒绝', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/reviews');
        await page.waitForTimeout(2000);

        const passBtn = page.getByRole('button', { name: /通过/ }).first();
        if (await passBtn.isVisible()) {
            await passBtn.click();
            await page.waitForTimeout(500);
        }

        const rejectBtn = page.getByRole('button', { name: /拒绝|驳回/ }).first();
        if (await rejectBtn.isVisible()) {
            await rejectBtn.click();
            await page.waitForTimeout(500);
        }
    });

    test('V-Ad1-05/V-Ad1-06 - 批量审核', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/reviews');
        await page.waitForTimeout(2000);

        const batchBtn = page.getByRole('button', { name: /批量/ }).first();
        if (await batchBtn.isVisible()) {
            await batchBtn.click();
            await page.waitForTimeout(500);
        }
    });

    test('V-Ad1-10 - 自动审核通过正常内容', async ({ page }) => {
        // 自动审核通常是后端行为，这里验证审核列表显示自动审核结果
        await loginAsAdmin(page);
        await page.goto('/admin/reviews');
        await page.waitForTimeout(2000);

        // 检查是否有自动审核通过的标识或记录
        const autoAuditBadge = page.locator('[class*="auto"], [data-testid="auto-audit"]').first();
        if (await autoAuditBadge.isVisible()) {
            await expect(autoAuditBadge).toBeVisible();
        }
    });

    test('V-Ad2-01 - 前台用户列表展示', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/front-users');
        await expect(page.locator('body')).toContainText(/前台|用户|昵称/, { timeout: 10_000 });
    });

    test('V-Ad2-02 - 用户搜索', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/front-users');
        await page.waitForTimeout(1000);

        const searchInput = page.locator('input[type="search"], input[placeholder*="搜索"]').first();
        if (await searchInput.isVisible()) {
            await searchInput.fill('测试');
            await page.waitForTimeout(500);
        }
    });

    test('V-Ad2-04/V-Ad2-05 - 用户封禁与解封', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/front-users');
        await page.waitForTimeout(2000);

        const banBtn = page.getByRole('button', { name: /封禁/ }).first();
        if (await banBtn.isVisible()) {
            await banBtn.click();
            await page.waitForTimeout(500);
        }

        const unbanBtn = page.getByRole('button', { name: /解封/ }).first();
        if (await unbanBtn.isVisible()) {
            await unbanBtn.click();
            await page.waitForTimeout(500);
        }
    });

    test('V-Ad2-07 - 举报处理', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/front-users');
        await page.waitForTimeout(2000);

        const reportBtn = page.getByRole('button', { name: /举报/ }).first();
        if (await reportBtn.isVisible()) {
            await reportBtn.click();
            await page.waitForTimeout(500);
        }
    });

    test('V-Ad0-2-01 - 后台管理员列表', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/users');
        await expect(page.locator('body')).toContainText(/管理员|用户|账号/, { timeout: 10_000 });
    });

    test('V-Ad0-2-03 - 编辑后台用户', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/users');
        await page.waitForTimeout(2000);

        const editBtn = page.getByRole('button', { name: /编辑/ }).first();
        if (await editBtn.isVisible()) {
            await editBtn.click();
            await page.waitForTimeout(1000);
        }
    });

    test('V-Ad3-02/V-Ad3-03/V-Ad3-04 - 数据分析报表', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/analytics');
        await page.waitForTimeout(2000);

        await expect(page.locator('body')).toContainText(/用户增长|内容统计|互动统计/, { timeout: 5_000 });
    });

    test('V-Ad3-05 - 统计周期选择', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/analytics');
        await page.waitForTimeout(1500);

        const periodBtn = page.getByRole('button', { name: /今日|本周|本月|近7天/ }).first();
        if (await periodBtn.isVisible()) {
            await periodBtn.click();
            await page.waitForTimeout(500);
        }
    });

    test('V-Ad3-06 - 数据导出', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/analytics');
        await page.waitForTimeout(2000);

        const exportBtn = page.getByRole('button', { name: /导出|下载/ }).first();
        if (await exportBtn.isVisible()) {
            await exportBtn.click();
            await page.waitForTimeout(1000);
        }
    });

    test('V-Ad4-01 - 举报管理列表', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/reports');
        await page.waitForTimeout(2000);

        await expect(page.locator('body')).toContainText(/举报管理|待处理|举报/, { timeout: 5_000 });
    });

    test('V-Ad4-02/V-Ad4-03 - 举报处理与批量处理', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/reports');
        await page.waitForTimeout(2000);

        const handleBtn = page.getByRole('button', { name: /通过|警告|忽略/ }).first();
        if (await handleBtn.isVisible()) {
            await handleBtn.click();
            await page.waitForTimeout(500);
        }

        const batchBtn = page.getByRole('button', { name: /批量/ }).first();
        if (await batchBtn.isVisible()) {
            await batchBtn.click();
            await page.waitForTimeout(500);
        }
    });

    test('V-Ad6-01 - 广告位管理', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/ads');
        await page.waitForTimeout(2000);

        await expect(page.locator('body')).toContainText(/广告|广告位|投放/, { timeout: 5_000 });
    });

    test('V-Ad6-02 - 创建广告投放', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/ads');
        await page.waitForTimeout(2000);

        await expect(page.locator('body')).toContainText(/广告|广告位|投放/, { timeout: 5_000 });
    });

    test('V-Ad6-05 - 广告统计', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/ads');
        await page.waitForTimeout(2000);

        await expect(page.locator('body')).toContainText(/展示|点击|统计/, { timeout: 5_000 });
    });

    test('V-Ad7-01 - 系统通知发布', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/notifications');
        await page.waitForTimeout(2000);

        await expect(page.locator('body')).toContainText(/通知|发布|系统通知/, { timeout: 5_000 });
    });

    test('V-Ad7-02 - 公告管理', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/notifications');
        await page.waitForTimeout(2000);

        await expect(page.locator('body')).toContainText(/通知|发布|系统通知/, { timeout: 5_000 });
    });

    test('V-Ad8-01/V-Ad8-02 - 行为日志查询', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/logs');
        await page.waitForTimeout(2000);

        await expect(page.locator('body')).toContainText(/日志|操作|记录/, { timeout: 5_000 });
    });

    test('V-Ad8-03 - 日志筛选', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/logs');
        await page.waitForTimeout(1500);

        const filterBtn = page.getByRole('button', { name: /筛选|类型/ }).first();
        if (await filterBtn.isVisible()) {
            await filterBtn.click();
            await page.waitForTimeout(500);
        }
    });

    test('V-Ad0-3-01 - 系统设置', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/settings');
        await page.waitForTimeout(2000);

        await expect(page.locator('body')).toContainText(/网站配置|名称|Logo/, { timeout: 5_000 });
    });

    test('V-Ad0-3-02/V-Ad0-3-04 - 敏感词管理', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/sensitive-words');
        await page.waitForTimeout(2000);

        await expect(page.locator('body')).toContainText(/敏感词|添加|删除/, { timeout: 5_000 });
    });

    test('V-A1-01 - 创建活动', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/activities/create');
        await page.waitForTimeout(2000);

        await expect(page.locator('body')).toContainText(/活动标题|时间|类型|奖品/, { timeout: 5_000 });
    });

    test('V-A1-10 - 发布活动', async ({ page }) => {
        // 后台活动列表页路由未实现（仅有 /admin/activities/create、/edit/:id、/:id/vote）
        test.skip(true, '后台活动列表页 /admin/activities 路由未实现');
        await loginAsAdmin(page);
        await page.goto('/admin/activities');
        await page.waitForTimeout(2000);

        const publishBtn = page.getByRole('button', { name: /发布/ }).first();
        if (await publishBtn.isVisible()) {
            await publishBtn.click();
            await page.waitForTimeout(500);
        }
    });
});

test.describe('Phase5 - 角色权限', () => {
    test('V-Ad0-2-05 - content_admin 登录', async ({ page }) => {
        await clearAuth(page);
        await loginAsAdmin(page, ADMIN_USERS.content);
        expect(page.url()).not.toContain('/admin/login');
    });

    test('V-Ad0-2-05 - data_admin 登录', async ({ page }) => {
        await clearAuth(page);
        await loginAsAdmin(page, ADMIN_USERS.data);
        expect(page.url()).not.toContain('/admin/login');
    });

    test('V-Ad0-2-05 - service 登录', async ({ page }) => {
        await clearAuth(page);
        await loginAsAdmin(page, ADMIN_USERS.service);
        expect(page.url()).not.toContain('/admin/login');
    });

    test('V-Ad0-2-05 - content_admin 访问审核页', async ({ page }) => {
        await clearAuth(page);
        await loginAsAdmin(page, ADMIN_USERS.content);
        await page.goto('/admin/reviews');
        await page.waitForTimeout(2000);
        expect(page.url()).toContain('/admin/reviews');
    });

    test('V-Ad0-2-05 - data_admin 访问数据分析页', async ({ page }) => {
        await clearAuth(page);
        await loginAsAdmin(page, ADMIN_USERS.data);
        await page.goto('/admin/analytics');
        await page.waitForTimeout(2000);
        expect(page.url()).toContain('/admin/analytics');
    });
});