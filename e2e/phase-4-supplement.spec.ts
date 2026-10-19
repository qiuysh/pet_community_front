import { test, expect } from '@playwright/test';
import { clearAuth, loginAsUser } from './fixtures/auth';

/**
 * Phase4 补充用例：推荐流翻页加载（R2）、话题创建门禁/提交（T5）。
 * 缺口来源：docs/specs/e2e-coverage-audit.md §二/§三
 * 需求语义：docs/specs/id-traceability.md §4.4
 */

test.describe('Phase4 补充 - 列表加载（V-R2）', () => {
    test.beforeEach(async ({ page }) => {
        await clearAuth(page);
    });

    test('V-R2-01 - 动态列表翻页加载', async ({ page }) => {
        await page.goto('/posts');
        const pageInfo = page.locator('.page-info');
        await expect(pageInfo).toBeVisible({ timeout: 10_000 });

        const firstPageText = (await pageInfo.innerText()).trim();
        const nextBtn = page.getByRole('button', { name: '下一页' });

        // 只有一页时无法验证翻页，跳过而非静默通过
        test.skip(await nextBtn.isDisabled(), '动态列表仅一页，无法验证翻页');

        const listRespPromise = page.waitForResponse(
            (r) => r.url().includes('/api/v1/posts') && r.request().method() === 'GET',
            { timeout: 15_000 },
        );
        await nextBtn.click();
        const listResp = await listRespPromise;
        expect(listResp.ok(), `翻页请求失败: ${listResp.status()}`).toBeTruthy();

        await expect(pageInfo).not.toHaveText(firstPageText, { timeout: 10_000 });
        await expect(pageInfo).toContainText('第 2 页', { timeout: 10_000 });
    });
});

test.describe('Phase4 补充 - 话题创建（V-T5）', () => {
    test.beforeEach(async ({ page }) => {
        await clearAuth(page);
    });

    test('V-T5-01 - 话题创建：等级门禁提示或提交成功（§4.3 须 Lv5+）', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/topics/create');

        const levelTip = page.getByText(/创建话题需达到/);
        const submitBtn = page.getByRole('button', { name: '提交创建申请' });
        const blocked = await levelTip.isVisible().catch(() => false);

        if (blocked) {
            // 未达 Lv5：应给出等级门禁提示，且提交按钮禁用
            await expect(levelTip).toBeVisible();
            await expect(submitBtn).toBeDisabled();
            return;
        }

        // 已达 Lv5：填写并提交，后端进入待审
        const name = `e2e话题${Date.now() % 100000}`;
        await page.getByPlaceholder('如：橘猫减肥打卡').fill(name);
        await page.getByPlaceholder('简单介绍话题内容与参与规则').fill('e2e 自动化创建的话题');

        const postPromise = page.waitForResponse(
            (r) => r.request().method() === 'POST' && /\/api\/v1\/topics$/.test(r.url()),
            { timeout: 15_000 },
        );
        await submitBtn.click();
        const postResp = await postPromise;
        expect(postResp.ok(), `提交话题失败: ${postResp.status()}`).toBeTruthy();

        await expect(page.getByText(/话题已提交|等待管理员审核/)).toBeVisible({ timeout: 10_000 });
    });
});
