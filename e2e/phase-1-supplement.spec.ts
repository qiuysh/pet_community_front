import { test, expect, type Page } from '@playwright/test';
import { clearAuth, loginAsUser, apiWrite } from './fixtures/auth';

/**
 * Phase1 补充用例：注册表单校验、用户设置保存闭环、宠物档案主流程。
 * 缺口来源：docs/specs/e2e-coverage-audit.md §三
 * 需求语义：docs/specs/id-traceability.md §4.1
 *
 * 说明：本文件只补测试，不改业务代码。写操作（改昵称、建宠物）幂等且用时间戳隔离。
 */

/** 1×1 透明 PNG，用于文件上传类用例 */
const TINY_PNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
);

/** 创建宠物档案并返回宠物 ID（供编辑/相册/成长记录用例复用） */
async function createPetAndGetId(page: Page, name: string): Promise<number> {
    await page.goto('/pets/create');
    await page.getByPlaceholder('给你的毛孩子起个名字吧').fill(name);

    const respPromise = page.waitForResponse(
        (r) => r.url().includes('/api/v1/pets') && r.request().method() === 'POST',
        { timeout: 15_000 },
    );
    await page.getByRole('button', { name: '创建档案' }).click();
    const resp = await respPromise;
    expect(resp.ok(), `创建宠物失败: ${resp.status()}`).toBeTruthy();

    const body = (await resp.json().catch(() => ({}))) as { data?: { id?: number }; id?: number };
    const id = Number(body?.data?.id ?? body?.id ?? 0);
    expect(id, '创建宠物响应缺少 id').toBeGreaterThan(0);
    return id;
}

test.describe('Phase1 补充 - 注册表单校验（V-U1）', () => {
    test.beforeEach(async ({ page }) => {
        await clearAuth(page);
    });

    test('V-U1-02 - 两次密码不一致时提示', async ({ page }) => {
        await page.goto('/register');
        await page.getByPlaceholder('请输入手机号').fill('13900000001');
        await page.getByPlaceholder('请输入验证码').fill('123456');
        await page.getByPlaceholder('请设置6-20位密码').fill('user123456');
        await page.getByPlaceholder('请再次输入密码').fill('user654321');

        await page.getByRole('button', { name: /^注册$/ }).click();

        await expect(page.getByText('两次密码输入不一致')).toBeVisible({ timeout: 5_000 });
    });

    test('V-U1-04 - 未填验证码时提示', async ({ page }) => {
        await page.goto('/register');
        await page.getByPlaceholder('请输入手机号').fill('13900000001');
        await page.getByPlaceholder('请设置6-20位密码').fill('user123456');
        await page.getByPlaceholder('请再次输入密码').fill('user123456');

        await page.getByRole('button', { name: /^注册$/ }).click();

        await expect(page.getByText('请输入验证码')).toBeVisible({ timeout: 5_000 });
    });
});

test.describe('Phase1 补充 - 用户设置保存闭环（V-U6/U7/U8）', () => {
    test.beforeEach(async ({ page }) => {
        await clearAuth(page);
    });

    test('V-U6-02 - 修改昵称并保存', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/settings');

        const nickname = `e2e昵称${Date.now() % 100000}`;
        const nicknameInput = page.getByPlaceholder('请输入昵称').first();
        await nicknameInput.fill(nickname);

        const putPromise = page.waitForResponse(
            (r) => r.url().includes('/api/v1/user/profile') && r.request().method() === 'PUT',
            { timeout: 10_000 },
        );
        await page.getByRole('button', { name: '保存修改' }).click();
        const putResp = await putPromise;
        expect(putResp.ok(), `保存资料失败: ${putResp.status()}`).toBeTruthy();

        // 刷新后仍为新昵称（落库校验，而非仅 toast）
        await page.reload();
        await expect(page.getByPlaceholder('请输入昵称').first()).toHaveValue(nickname, {
            timeout: 10_000,
        });
    });

    test('V-U8-02/V-U8-03 - 私信权限设为「仅粉丝」并保存（结束后恢复「所有人」）', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/settings');
        await page.getByRole('button', { name: '隐私设置' }).click();

        const permGroup = page.locator('[aria-label="私信权限"]');
        await permGroup.getByText('仅粉丝').click();

        const putPromise = page.waitForResponse(
            (r) => r.url().includes('/api/v1/user/privacy') && r.request().method() === 'PUT',
            { timeout: 10_000 },
        );
        await page.getByRole('button', { name: '保存隐私设置' }).click();
        const putResp = await putPromise;
        expect(putResp.ok(), `保存隐私设置失败: ${putResp.status()}`).toBeTruthy();

        // 接口层校验：messagePermission = 1（仅粉丝）
        const readResp = await apiWrite(page, 'get', '/api/v1/user/privacy');
        const privacy = (await readResp.json().catch(() => ({}))) as {
            data?: { messagePermission?: number };
        };
        expect(privacy?.data?.messagePermission).toBe(1);

        // 恢复为「所有人」，避免影响 M1-03 之外的其它用例
        await page.reload();
        await page.getByRole('button', { name: '隐私设置' }).click();
        await page.locator('[aria-label="私信权限"]').getByText('所有人').click();
        const restorePromise = page.waitForResponse(
            (r) => r.url().includes('/api/v1/user/privacy') && r.request().method() === 'PUT',
            { timeout: 10_000 },
        );
        await page.getByRole('button', { name: '保存隐私设置' }).click();
        expect((await restorePromise).ok()).toBeTruthy();
    });

    test('V-U7-02 - 修改密码两次新密码不一致时提示', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/settings');
        await page.getByRole('button', { name: '修改密码' }).click();

        await page.getByPlaceholder('请输入原密码').fill('wrong-old-pwd');
        await page.getByPlaceholder('请输入6-20位新密码').fill('newpass123');
        await page.getByPlaceholder('请再次输入新密码').fill('newpass456');

        const submitBtn = page.getByRole('button', { name: /提交|确认|保存|修改密码$/ }).last();
        await submitBtn.click();

        // 前端校验优先于接口请求：应出现不一致提示且不发起改密请求
        await expect(page.getByText(/两次.*不一致|密码不一致/)).toBeVisible({ timeout: 5_000 });
    });
});

test.describe('Phase1 补充 - 宠物档案主流程（V-P1/P2/P3）', () => {
    test.beforeEach(async ({ page }) => {
        await clearAuth(page);
    });

    test('V-P1-02 - 创建宠物档案闭环', async ({ page }) => {
        await loginAsUser(page);
        const name = `e2e宠物${Date.now() % 100000}`;
        const id = await createPetAndGetId(page, name);

        // 详情页应展示该宠物名称（落库校验）
        await page.goto(`/pets/${id}`);
        await expect(page.locator('body')).toContainText(name, { timeout: 10_000 });
    });

    test('V-P1-06 - 编辑宠物档案并保存', async ({ page }) => {
        await loginAsUser(page);
        const origin = `e2e宠物${Date.now() % 100000}`;
        const id = await createPetAndGetId(page, origin);
        const updated = `e2e改名${Date.now() % 100000}`;

        await page.goto(`/pets/${id}/edit`);
        await page.getByPlaceholder('给你的毛孩子起个名字吧').fill(updated);

        const putPromise = page.waitForResponse(
            (r) => r.url().includes(`/api/v1/pets/${id}`) && r.request().method() === 'PUT',
            { timeout: 15_000 },
        );
        await page.getByRole('button', { name: '保存修改' }).click();
        const putResp = await putPromise;
        expect(putResp.ok(), `编辑宠物失败: ${putResp.status()}`).toBeTruthy();

        await page.goto(`/pets/${id}`);
        await expect(page.locator('body')).toContainText(updated, { timeout: 10_000 });
    });

    test('V-P2-02 - 相册上传照片（主人视角）', async ({ page }) => {
        await loginAsUser(page);
        const id = await createPetAndGetId(page, `e2e相册${Date.now() % 100000}`);

        await page.goto(`/pets/${id}`);
        await page.getByRole('tab', { name: /相册/ }).click();

        const fileInput = page.locator('input[type="file"][accept*="image"]').first();
        await fileInput.setInputFiles({
            name: 'e2e-album.png',
            mimeType: 'image/png',
            buffer: TINY_PNG,
        });

        const albumPromise = page.waitForResponse(
            (r) => r.request().method() === 'POST' && /\/api\/v1\/pets\/\d+\/album$/.test(r.url()),
            { timeout: 20_000 },
        );
        const albumResp = await albumPromise;
        expect(albumResp.ok(), `相册入库失败: ${albumResp.status()}`).toBeTruthy();

        // 相册项出现后应带「设为封面」操作（仅主人可见）
        await expect(page.getByRole('button', { name: '设为封面' }).first()).toBeVisible({
            timeout: 15_000,
        });
    });

    test('V-P3-01 - 新增成长记录', async ({ page }) => {
        await loginAsUser(page);
        const id = await createPetAndGetId(page, `e2e记录${Date.now() % 100000}`);

        await page.goto(`/pets/${id}`);
        await page.getByRole('tab', { name: /成长记录/ }).click();
        await page.getByRole('button', { name: '添加记录' }).click();

        const dialog = page.getByRole('dialog');
        const title = `e2e成长${Date.now() % 100000}`;
        await dialog.locator('input:not([type="hidden"]):not([type="date"])').first().fill(title);
        await dialog.locator('input[type="date"]').first().fill('2026-10-16');
        await dialog.locator('textarea').first().fill('e2e 自动化写入的成长记录');

        const postPromise = page.waitForResponse(
            (r) => r.request().method() === 'POST' && r.url().includes('/growth-records'),
            { timeout: 15_000 },
        );
        await dialog.getByRole('button', { name: /^保存$/ }).click();
        const postResp = await postPromise;
        expect(postResp.ok(), `新增成长记录失败: ${postResp.status()}`).toBeTruthy();

        await expect(page.locator('body')).toContainText(title, { timeout: 10_000 });
    });
});
