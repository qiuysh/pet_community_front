import { test, expect, type Page } from '@playwright/test';
import { clearAuth, loginAsUser } from './fixtures/auth';

/**
 * Phase2 补充用例：草稿箱闭环（D8）、视频/话题/定位编辑（D2/D3/D6）、动态删除闭环（I7）。
 * 缺口来源：docs/specs/e2e-coverage-audit.md §三
 * 需求语义：docs/specs/id-traceability.md §4.2
 */

/** 发布一条纯文字动态并返回动态 ID */
async function publishPost(page: Page, content: string): Promise<number> {
    await page.goto('/posts/create');
    await page.locator('.content-input').first().fill(content);

    const respPromise = page.waitForResponse(
        (r) => r.request().method() === 'POST' && /\/api\/v1\/posts$/.test(r.url()),
        { timeout: 15_000 },
    );
    await page.locator('.publish-btn').first().click();
    const resp = await respPromise;
    expect(resp.ok(), `发布动态失败: ${resp.status()}`).toBeTruthy();

    const body = (await resp.json().catch(() => ({}))) as { data?: { id?: number }; id?: number };
    return Number(body?.data?.id ?? body?.id ?? 0);
}

test.describe('Phase2 补充 - 草稿箱闭环（V-D8）', () => {
    test.beforeEach(async ({ page }) => {
        await clearAuth(page);
    });

    test('V-D8-01 - 存草稿后在草稿箱可见', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/posts/create');

        const content = `e2e草稿_${Date.now()}`;
        await page.locator('.content-input').first().fill(content);

        const draftPromise = page.waitForResponse(
            (r) => r.request().method() === 'POST' && /\/api\/v1\/drafts$/.test(r.url()),
            { timeout: 15_000 },
        );
        await page.getByRole('button', { name: '存草稿' }).click();
        const draftResp = await draftPromise;
        expect(draftResp.ok(), `存草稿失败: ${draftResp.status()}`).toBeTruthy();

        await page.goto('/posts/drafts');
        await expect(page.locator('body')).toContainText(content, { timeout: 10_000 });
    });

    test('V-D8-04 - 草稿续编并发布', async ({ page }) => {
        await loginAsUser(page);

        // 前置：先存一条草稿
        const content = `e2e续编_${Date.now()}`;
        await page.goto('/posts/create');
        await page.locator('.content-input').first().fill(content);
        await page.getByRole('button', { name: '存草稿' }).click();
        await page.waitForResponse(
            (r) => r.request().method() === 'POST' && /\/api\/v1\/drafts$/.test(r.url()),
            { timeout: 15_000 },
        );

        // 草稿箱 → 继续编辑
        await page.goto('/posts/drafts');
        await page.getByRole('button', { name: '继续编辑' }).first().click();
        await expect(page).toHaveURL(/\/posts\/drafts\/\d+/, { timeout: 10_000 });
        await expect(page.locator('.content-input').first()).toHaveValue(content, {
            timeout: 10_000,
        });

        // 续编后发布
        const publishPromise = page.waitForResponse(
            (r) => r.request().method() === 'POST' && /\/api\/v1\/posts$/.test(r.url()),
            { timeout: 15_000 },
        );
        await page.locator('.publish-btn').first().click();
        const publishResp = await publishPromise;
        expect(publishResp.ok(), `草稿发布失败: ${publishResp.status()}`).toBeTruthy();
    });
});

test.describe('Phase2 补充 - 编辑器能力（V-D2/D3/D6）', () => {
    test.beforeEach(async ({ page }) => {
        await clearAuth(page);
    });

    test('V-D2-01 - 视频选择预览与移除', async ({ page }) => {
        // 说明：真实视频转码/上传不在 E2E 环境验证（需转码服务），
        // 本用例覆盖编辑器视频选择的 UI 主流程：选择 → 预览渲染 → 移除。
        await loginAsUser(page);
        await page.goto('/posts/create');

        const videoInput = page.locator('input[type="file"][accept*="video"]').first();
        await videoInput.setInputFiles({
            name: 'e2e-clip.mp4',
            mimeType: 'video/mp4',
            buffer: Buffer.from('00000018667479706d703432', 'hex'),
        });

        await expect(page.locator('.video-item').first()).toBeVisible({ timeout: 10_000 });
        // 有视频后可发布（canPublish）
        await expect(page.locator('.publish-btn').first()).toBeEnabled({ timeout: 5_000 });

        await page.getByRole('button', { name: '删除视频' }).click();
        await expect(page.locator('.video-item')).toHaveCount(0, { timeout: 5_000 });
    });

    test('V-D3-02 - 关联话题并发布', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/posts/create');

        await page.locator('.content-input').first().fill(`e2e话题帖_${Date.now()}`);
        await page.getByText('添加话题').click();
        await page.getByPlaceholder('搜索话题').fill('猫');

        const suggestion = page.locator('.topic-suggestion').first();
        test.skip((await suggestion.count()) === 0, '暂无可关联的话题数据');
        const topicName = (await suggestion.locator('.topic-name').innerText()).trim();
        await suggestion.click();

        // 已选话题标签渲染
        await expect(page.locator('.topic-tag').first()).toContainText(topicName, {
            timeout: 5_000,
        });

        const postId = await (async () => {
            const respPromise = page.waitForResponse(
                (r) => r.request().method() === 'POST' && /\/api\/v1\/posts$/.test(r.url()),
                { timeout: 15_000 },
            );
            await page.locator('.publish-btn').first().click();
            const resp = await respPromise;
            expect(resp.ok(), `发布失败: ${resp.status()}`).toBeTruthy();
            const body = (await resp.json().catch(() => ({}))) as {
                data?: { id?: number };
                id?: number;
            };
            return Number(body?.data?.id ?? body?.id ?? 0);
        })();

        expect(postId, '发布响应缺少 id').toBeGreaterThan(0);
        await page.goto(`/posts/${postId}`);
        await expect(page.locator('body')).toContainText(topicName, { timeout: 10_000 });
    });

    test('V-D6-02 - 设置定位并发布', async ({ page }) => {
        await loginAsUser(page);
        const location = '上海市静安区e2e';
        const content = `e2e定位帖_${Date.now()}`;

        // 必须在同一页填完正文+定位后直接发布；勿再 goto 创建页，否则表单被清空
        await page.goto('/posts/create');
        await page.locator('.content-input').first().fill(content);
        await page.locator('.location-input').first().fill(location);

        const respPromise = page.waitForResponse(
            (r) => r.request().method() === 'POST' && /\/api\/v1\/posts$/.test(r.url()),
            { timeout: 15_000 },
        );
        await page.locator('.publish-btn').first().click();
        const resp = await respPromise;
        expect(resp.ok(), `发布失败: ${resp.status()}`).toBeTruthy();
        const body = (await resp.json().catch(() => ({}))) as {
            data?: { id?: number };
            id?: number;
        };
        const postId = Number(body?.data?.id ?? body?.id ?? 0);
        expect(postId, '发布响应缺少 id').toBeGreaterThan(0);

        await page.goto(`/posts/${postId}`);
        await expect(page.locator('body')).toContainText(location, { timeout: 10_000 });
    });
});

test.describe('Phase2 补充 - 动态管理闭环（V-I7）', () => {
    test.beforeEach(async ({ page }) => {
        await clearAuth(page);
    });

    test('V-I7-02 - 删除自己的动态后不可访问', async ({ page }) => {
        await loginAsUser(page);
        const content = `e2e待删除_${Date.now()}`;
        const postId = await publishPost(page, content);
        expect(postId, '发布响应缺少 id').toBeGreaterThan(0);

        await page.goto(`/posts/${postId}`);
        await page.getByRole('button', { name: '动态操作' }).click();
        await page.getByRole('button', { name: '删除' }).click();

        const deletePromise = page.waitForResponse(
            (r) => r.request().method() === 'DELETE' && r.url().includes(`/api/v1/posts/${postId}`),
            { timeout: 15_000 },
        );
        await page.getByRole('button', { name: '删除' }).last().click();
        const deleteResp = await deletePromise;
        expect(deleteResp.ok(), `删除动态失败: ${deleteResp.status()}`).toBeTruthy();

        // 删除后重新访问：正文不再展示
        await page.goto(`/posts/${postId}`);
        await expect(page.locator('body')).not.toContainText(content, { timeout: 10_000 });
    });
});
