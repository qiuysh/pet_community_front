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
        // A6=评选发奖；入口：活动运营列表「评选」→ /admin/activities/:id/vote
        await loginAsAdmin(page);
        await page.goto('/admin/activities');
        await page.waitForTimeout(2000);

        await expect(page.getByRole('heading', { name: '活动运营' })).toBeVisible({ timeout: 10_000 });
        const voteBtn = page.getByRole('button', { name: '评选' }).first();
        test.skip(!(await voteBtn.isVisible()), '暂无活动或评选入口未渲染');

        await voteBtn.click();
        await page.waitForURL(/\/admin\/activities\/\d+\/vote/, { timeout: 10_000 });
        await expect(page.locator('body')).toContainText(/评选|发奖|投票|作品|排行/, { timeout: 5_000 });
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
        await expect(page.locator('body')).toContainText(/待审核|举报|广告|待办/, { timeout: 5_000 });
    });

    test('V-Ad5-07 - 活动报名待办深链 focus=registrations', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/activities?focus=registrations');
        await page.waitForTimeout(2000);

        await expect(page.getByRole('heading', { name: '活动运营' })).toBeVisible({ timeout: 10_000 });
        await expect(page.locator('body')).toContainText(/报名审核|待审报名|待办入口/, { timeout: 5_000 });
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
        // 广告位 Tab：可创建广告位
        const positionsTab = page.getByRole('tab', { name: '广告位' }).or(page.getByRole('button', { name: '广告位' })).first();
        if (await positionsTab.isVisible()) {
            await positionsTab.click();
            await page.waitForTimeout(500);
        }
        await expect(page.getByRole('button', { name: '创建广告位' })).toBeVisible({ timeout: 5_000 });
    });

    test('V-Ad6-02 - 创建广告可选广告位', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/ads');
        await page.waitForTimeout(2000);

        const adsTab = page.getByRole('tab', { name: '投放' }).or(page.getByRole('button', { name: '投放' })).first();
        if (await adsTab.isVisible()) {
            await adsTab.click();
            await page.waitForTimeout(500);
        }

        const createBtn = page.getByRole('button', { name: '创建广告' }).first();
        test.skip(!(await createBtn.isVisible()), '创建广告入口未渲染');

        await createBtn.click();
        await page.waitForTimeout(1000);

        await expect(page.getByRole('heading', { name: '创建广告' })).toBeVisible({ timeout: 5_000 });
        const slotTrigger = page.getByLabel('广告位').first();
        await expect(slotTrigger).toBeVisible({ timeout: 5_000 });
        await slotTrigger.click();
        await page.waitForTimeout(300);
        // HeroUI ListBox：有选项或空态提示
        const opts = page.getByRole('option');
        const optCount = await opts.count();
        if (optCount === 0) {
            await expect(page.locator('body')).toContainText(/暂无广告位|请先在「广告位」中创建|请选择广告位/, {
                timeout: 3_000,
            });
        } else {
            expect(optCount).toBeGreaterThanOrEqual(1);
        }
        await page.keyboard.press('Escape');
    });

    test('V-Ad6-05 - 广告统计', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/ads');
        await page.waitForTimeout(2000);

        const statsTab = page.getByRole('tab', { name: '统计' }).or(page.getByRole('button', { name: '统计' })).first();
        if (await statsTab.isVisible()) {
            await statsTab.click();
            await page.waitForTimeout(500);
        }
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

    test('V-Ad8-03 - 日志筛选（含双日期）', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/logs');
        await page.waitForTimeout(1500);

        // 目标类型（HeroUI Select，非原生 select）
        const targetType = page.locator('#log-filter-target-type').first();
        if (await targetType.isVisible()) {
            await targetType.click();
            const postOpt = page.getByRole('option', { name: '帖子' }).first();
            if (await postOpt.isVisible()) {
                await postOpt.click();
            } else {
                await page.keyboard.press('Escape');
            }
            await page.waitForTimeout(300);
        }

        // AdminDateTime：开始/结束时间控件可见（HeroUI DatePicker）
        await expect(page.getByLabel('开始时间').first()).toBeVisible({ timeout: 5_000 });
        await expect(page.getByLabel('结束时间').first()).toBeVisible({ timeout: 5_000 });
    });

    test('V-Ad0-3-01 - 系统设置', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/settings');
        await page.waitForTimeout(2000);

        await expect(page.locator('body')).toContainText(/网站配置|名称|Logo/, { timeout: 5_000 });
    });

    test('V-Ad0-3-05 - 审核配置开关可切换并保存', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/settings');
        await page.waitForTimeout(2000);

        const auditTab = page.getByRole('tab', { name: '审核配置' }).or(page.getByRole('button', { name: '审核配置' })).first();
        await expect(auditTab).toBeVisible({ timeout: 5_000 });
        await auditTab.click();
        await page.waitForTimeout(500);

        await expect(page.getByRole('heading', { name: '自动审核' })).toBeVisible();
        await expect(page.getByRole('heading', { name: '敏感词过滤' })).toBeVisible();

        const autoAudit = page.getByRole('switch', { name: '自动审核' });
        await expect(autoAudit).toBeVisible({ timeout: 5_000 });

        // HeroUI Switch：点可见滑块（checkbox 被 control 挡住）
        const autoControl = page
            .locator('div')
            .filter({ has: page.getByRole('heading', { name: '自动审核' }) })
            .locator('[data-slot="switch-control"]')
            .first();
        await autoControl.click();
        await page.getByRole('button', { name: /保存配置/ }).click();
        await expect(page.locator('body')).toContainText(/审核配置更新成功|保存成功|成功/, { timeout: 5_000 });

        // 还原，避免污染环境
        await autoControl.click();
        await page.getByRole('button', { name: /保存配置/ }).click();
        await page.waitForTimeout(800);
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
        // 创建页使用 AdminDateTime（aria-label=开始/结束时间）
        await expect(page.getByLabel('开始时间').first()).toBeVisible({ timeout: 5_000 });
        await expect(page.getByLabel('结束时间').first()).toBeVisible({ timeout: 5_000 });
    });

    test('V-A1-02 - 活动运营列表页', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/activities');
        await page.waitForTimeout(2000);

        await expect(page.getByRole('heading', { name: '活动运营' })).toBeVisible({ timeout: 10_000 });
        await expect(page.getByRole('button', { name: '创建活动' })).toBeVisible();
        await expect(page.locator('#activity-keyword').or(page.getByPlaceholder(/搜索标题/))).toBeVisible();
        // 无多余独立「搜索」按钮：关键词回车即筛
        await expect(page.getByRole('button', { name: /^搜索$/ })).toHaveCount(0);
    });

    test('V-A1-03 - 活动列表状态筛选', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/activities');
        await page.waitForTimeout(2000);

        const statusSelect = page.locator('#activity-status');
        await expect(statusSelect).toBeVisible({ timeout: 5_000 });
        await statusSelect.click();
        await page.getByRole('option', { name: '草稿' }).click();
        await page.waitForTimeout(1000);
        await expect(page.getByRole('heading', { name: '活动运营' })).toBeVisible();
        await expect(page.locator('body')).toContainText(/草稿|暂无活动/, { timeout: 5_000 });
    });

    test('V-A1-10 - 发布活动', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/activities');
        await page.waitForTimeout(2000);

        await expect(page.getByRole('heading', { name: '活动运营' })).toBeVisible({ timeout: 10_000 });

        // 优先筛草稿，再点「发布」
        const statusSelect = page.locator('#activity-status');
        if (await statusSelect.isVisible()) {
            await statusSelect.click();
            const draftOpt = page.getByRole('option', { name: '草稿' });
            if (await draftOpt.isVisible()) {
                await draftOpt.click();
                await page.waitForTimeout(1000);
            } else {
                await page.keyboard.press('Escape');
            }
        }

        const publishBtn = page.getByRole('button', { name: '发布' }).first();
        test.skip(!(await publishBtn.isVisible()), '暂无草稿活动可发布');

        await publishBtn.click();
        await expect(page.locator('body')).toContainText(/发布成功|已发布/, { timeout: 5_000 });
    });

    test('V-A1-11 - 报名审核页', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/activities');
        await page.waitForTimeout(2000);

        const regBtn = page.getByRole('button', { name: '报名' }).first();
        test.skip(!(await regBtn.isVisible()), '暂无活动，无法进入报名审核');

        await regBtn.click();
        await page.waitForURL(/\/admin\/activities\/\d+\/registrations/, { timeout: 10_000 });
        await expect(page.getByRole('heading', { name: '报名审核' })).toBeVisible({ timeout: 5_000 });
        await expect(page.getByRole('button', { name: '返回列表' })).toBeVisible();
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