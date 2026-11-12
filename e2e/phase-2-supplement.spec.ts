import { test, expect, type Page, type Response } from '@playwright/test';
import { clearAuth, loginAsUser } from './fixtures/auth';

/**
 * Phase2 补充用例：草稿箱闭环（D8）、视频/话题/位置文案编辑（D2/D3/D6）、动态删除闭环（I7）。
 * 注：D6 定位地图（R14）尚未上线，当前只覆盖「位置文案输入 / 发布后展示」，不声称覆盖地图选点。
 * 缺口来源：docs/specs/e2e-coverage-audit.md §三
 * 需求语义：docs/specs/id-traceability.md §4.2
 */

/**
 * 发布一条纯文字动态并返回动态 ID。
 * beforePublish 可选：在填完正文、点发布之前插入额外步骤（如设置定位）。
 *
 * 注意：发布成功后会触发 SPA navigate(-1)，卸载文档会丢弃在途响应体，
 * 直接 resp.json() 会报 “navigated away”。因此通过 page.on('response') 监听
 * 把 body 在导航发生前取出，再校验业务 code 与 id。
 */
async function publishPost(
    page: Page,
    content: string,
    beforePublish?: (page: Page) => Promise<void>,
): Promise<number> {
    await page.goto('/posts/create');
    await page.locator('.content-input').first().fill(content);
    if (beforePublish) await beforePublish(page);

    type PublishBody = { code?: number; message?: string; data?: { id?: number }; id?: number };
    let capturedBody: PublishBody | null = null;
    let bodyReadyResolve: () => void = () => {};
    const bodyReady = new Promise<void>((resolve) => {
        bodyReadyResolve = resolve;
    });
    const onResponse = async (response: Response) => {
        if (response.request().method() === 'POST' && /\/api\/v1\/posts$/.test(response.url())) {
            try {
                capturedBody = (await response.json()) as PublishBody;
            } catch {
                capturedBody = null;
            }
            bodyReadyResolve();
        }
    };
    page.on('response', onResponse);

    const respPromise = page.waitForResponse(
        (r) => r.request().method() === 'POST' && /\/api\/v1\/posts$/.test(r.url()),
        { timeout: 15_000 },
    );
    await page.locator('.publish-btn').first().click();
    const resp = await respPromise;
    expect(resp.ok(), `发布动态失败: ${resp.status()}`).toBeTruthy();

    // 等监听把 body 取出（导航前），再校验业务 code 与 id
    await bodyReady;
    page.off('response', onResponse);

    const body = (capturedBody ?? {}) as PublishBody;
    expect(body.code, `发布动态业务失败: ${body.message}`).toBe(0);
    const id = Number(body.data?.id ?? body.id ?? 0);
    expect(id, `发布响应缺少 id（code=${body.code}, message=${body.message}）`).toBeGreaterThan(0);
    return id;
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
            const body = (await resp.json()) as {
                code?: number;
                message?: string;
                data?: { id?: number };
                id?: number;
            };
            expect(body.code, `发布失败: ${body.message}`).toBe(0);
            const id = Number(body?.data?.id ?? body?.id ?? 0);
            expect(id, `发布响应缺少 id（code=${body.code}）`).toBeGreaterThan(0);
            return id;
        })();

        expect(postId, '发布响应缺少 id').toBeGreaterThan(0);
        await page.goto(`/posts/${postId}`);
        await expect(page.locator('body')).toContainText(topicName, { timeout: 10_000 });
    });

    test('V-D6-02 - 设置定位并发布', async ({ page }) => {
        await loginAsUser(page);
        const location = '上海市静安区e2e';
        const content = `e2e定位帖_${Date.now()}`;

        // 定位经 LocationPicker 弹窗设置（.location-input 是展示文案的 span，不可直接 fill）；
        // 发布与取 id 复用 publishPost（在 SPA 导航前抓取响应体）。
        const postId = await publishPost(page, content, async (p) => {
            const locationTrigger = p.getByRole('button', { name: '选择所在位置' });
            await expect(locationTrigger).toBeVisible({ timeout: 10_000 });
            await locationTrigger.click();
            const locationModal = p.getByRole('dialog');
            await expect(locationModal).toBeVisible({ timeout: 5_000 });
            await locationModal.getByLabel('手输地名').fill(location);
            await locationModal.getByRole('button', { name: '使用文案' }).click();
            await expect(p.locator('.location-input').first()).toContainText(location, {
                timeout: 5_000,
            });
        });
        expect(postId, '发布响应缺少 id').toBeGreaterThan(0);

        await page.goto(`/posts/${postId}`, { waitUntil: 'domcontentloaded' });
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
        // 详情页操作是「更多操作」Dropdown（HeroUI menuitem），不是名为「动态操作」的 button；
        // 后者是列表卡片上 role="group" 的容器，不可点击。
        await page.getByRole('button', { name: '更多操作' }).click();
        await page.getByRole('menuitem', { name: '删除' }).click();

        const deletePromise = page.waitForResponse(
            (r) => r.request().method() === 'DELETE' && r.url().includes(`/api/v1/posts/${postId}`),
            { timeout: 15_000 },
        );
        await page.getByRole('button', { name: '删除', exact: true }).last().click();
        const deleteResp = await deletePromise;
        expect(deleteResp.ok(), `删除动态失败: ${deleteResp.status()}`).toBeTruthy();

        // 删除后重新访问：正文不再展示
        await page.goto(`/posts/${postId}`);
        await expect(page.locator('body')).not.toContainText(content, { timeout: 10_000 });
    });
});
