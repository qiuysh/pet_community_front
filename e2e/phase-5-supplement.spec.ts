import { test, expect, type Page } from '@playwright/test';
import { clearAuth, loginAsUser } from './fixtures/auth';

/**
 * Phase5 补充用例：活动报名/作品/投票结果断言（A3/A4/A5）、领养发布与申请闭环（A8）。
 * 缺口来源：docs/specs/e2e-coverage-audit.md §三
 * 需求语义：docs/specs/id-traceability.md §4.5
 */

/** 进入第一个活动详情页；无活动数据时跳过 */
async function gotoFirstActivity(page: Page) {
    await page.goto('/activities');
    const link = page.locator('a[href^="/activities/"]').first();
    test.skip((await link.count()) === 0, '暂无活动数据');
    await link.click();
    await expect(page).toHaveURL(/\/activities\/\d+/, { timeout: 10_000 });
}

test.describe('Phase5 补充 - 活动参与闭环（V-A3/A4/A5）', () => {
    test.beforeEach(async ({ page }) => {
        await clearAuth(page);
    });

    test('V-A3-02 - 活动报名提交成功后显示已报名', async ({ page }) => {
        await loginAsUser(page);
        await gotoFirstActivity(page);

        const regBtn = page.getByRole('button', { name: '立即报名' });
        test.skip(!(await regBtn.isVisible()), '当前活动报名未开放或已报名');

        await regBtn.click();
        const dialog = page.getByRole('dialog');
        await dialog.getByPlaceholder('请输入真实姓名').fill('e2e测试用户');
        await dialog.getByPlaceholder('请输入手机号').fill('13800138001');
        await dialog.getByPlaceholder('可补充报名说明…').fill('e2e 自动化报名');

        const postPromise = page.waitForResponse(
            (r) => r.request().method() === 'POST' && r.url().includes('/register'),
            { timeout: 15_000 },
        );
        await dialog.getByRole('button', { name: '提交报名' }).click();
        const postResp = await postPromise;
        expect(postResp.ok(), `报名失败: ${postResp.status()}`).toBeTruthy();

        await expect(page.getByText('已报名')).toBeVisible({ timeout: 10_000 });
    });

    test('V-A4-02 - 提交活动作品', async ({ page }) => {
        await loginAsUser(page);
        await gotoFirstActivity(page);

        const uploadBtn = page.getByRole('button', { name: '提交作品' });
        test.skip(!(await uploadBtn.isVisible()), '当前活动作品提交未开放或已提交');

        await uploadBtn.click();
        const dialog = page.getByRole('dialog');
        await dialog.getByPlaceholder('请输入作品标题').fill(`e2e作品_${Date.now() % 100000}`);
        await dialog.getByPlaceholder('请描述你的作品...').fill('e2e 自动化提交的作品');

        const postPromise = page.waitForResponse(
            (r) => r.request().method() === 'POST' && r.url().includes('/activities/submissions'),
            { timeout: 15_000 },
        );
        await dialog.getByRole('button', { name: '提交作品' }).click();
        const postResp = await postPromise;
        expect(postResp.ok(), `提交作品失败: ${postResp.status()}`).toBeTruthy();

        await expect(page.getByText('作品提交成功')).toBeVisible({ timeout: 10_000 });
    });

    test('V-A5-02 - 给作品投票并反馈结果', async ({ page }) => {
        await loginAsUser(page);
        await gotoFirstActivity(page);

        const submissionsTab = page.getByRole('tab', { name: '作品展示' });
        test.skip(!(await submissionsTab.isVisible()), '该活动无作品展示（非投票/评选类）');
        await submissionsTab.click();

        const voteBtn = page.getByRole('button', { name: /^投票$/ }).first();
        test.skip((await voteBtn.count()) === 0, '暂无可投票作品');

        const postPromise = page.waitForResponse(
            (r) => r.request().method() === 'POST' && r.url().includes('/activities/vote'),
            { timeout: 15_000 },
        );
        await voteBtn.click();
        const postResp = await postPromise;
        expect(postResp.ok(), `投票失败: ${postResp.status()}`).toBeTruthy();

        await expect(page.getByText(/投票成功|已投票/)).toBeVisible({ timeout: 10_000 });
    });
});

test.describe('Phase5 补充 - 领养闭环（V-A8）', () => {
    test.beforeEach(async ({ page }) => {
        await clearAuth(page);
    });

    test('V-A8-01 - 发布领养信息', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/adopts/create');

        await page.getByPlaceholder('请填写宠物名称').fill(`e2e领养${Date.now() % 100000}`);
        await page
            .getByPlaceholder('请详细描述宠物的情况、性格特点等')
            .fill('e2e 自动化发布的领养信息：健康、已驱虫');
        await page.getByPlaceholder('例如：北京市朝阳区').fill('上海市静安区');
        await page.getByPlaceholder('请填写联系电话').fill('13800138001');

        const postPromise = page.waitForResponse(
            (r) => r.request().method() === 'POST' && /\/api\/v1\/adopts$/.test(r.url()),
            { timeout: 15_000 },
        );
        await page.getByRole('button', { name: /^发布$/ }).click();
        const postResp = await postPromise;
        expect(postResp.ok(), `发布领养失败: ${postResp.status()}`).toBeTruthy();
    });

    test('V-A8-05 - 申请领养并提交申请', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/adopts');

        const link = page.locator('a[href^="/adopts/"]').first();
        test.skip((await link.count()) === 0, '暂无领养数据');
        await link.click();

        const applyBtn = page.getByRole('button', { name: '申请领养' });
        test.skip(!(await applyBtn.isVisible()), '当前领养不可申请（非待领养或为本人发布）');

        await applyBtn.click();
        const dialog = page.getByRole('dialog');
        await dialog
            .locator('textarea')
            .first()
            .fill('e2e 自动化申请：有稳定住所、家庭成员同意、可接受定期回访。');

        const postPromise = page.waitForResponse(
            (r) => r.request().method() === 'POST' && r.url().includes('/adopts/applications'),
            { timeout: 15_000 },
        );
        await dialog.getByRole('button', { name: '提交申请' }).click();
        const postResp = await postPromise;
        expect(postResp.ok(), `提交领养申请失败: ${postResp.status()}`).toBeTruthy();
    });
});
