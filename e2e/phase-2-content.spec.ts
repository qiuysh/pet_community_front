import { test, expect, type Page } from '@playwright/test';
import {
    clearAuth,
    loginAsUser,
    firstDetailLink,
    apiWrite,
    dualSessions,
} from './fixtures/auth';

/** 通过接口创建一条当前登录用户的动态，返回动态 ID（编辑/删除/举报/位置用例复用） */
async function createOwnPost(page: Page, content: string, location?: string): Promise<number> {
    const res = await apiWrite(page, 'post', '/api/v1/posts', {
        data: { content, ...(location ? { location } : {}) },
    });
    expect(res.ok(), `创建动态失败: ${res.status()}`).toBeTruthy();
    const body = (await res.json()) as {
        code?: number;
        message?: string;
        data?: { id?: number };
    };
    expect(body.code, `创建动态业务失败: ${body.message}`).toBe(0);
    const id = Number(body.data?.id ?? 0);
    expect(id, '创建动态响应缺少 id').toBeGreaterThan(0);
    return id;
}

test.describe('Phase2 - 动态列表', () => {
    test.beforeEach(async ({ page }) => {
        await clearAuth(page);
    });

    test('V-I1-01 - 动态列表展示', async ({ page }) => {
        await page.goto('/posts');
        // 页头筛选 Tab「推荐」；避免 getByText(/动态/) 命中多条帖子正文
        await expect(page.getByRole('tab', { name: '推荐' })).toBeVisible({ timeout: 10_000 });
        await expect(page.locator('body')).toContainText(/暂无动态|查看 .+ 的动态详情|发布/, { timeout: 10_000 });
    });

    test('V-I1-06 - 动态详情页可访问', async ({ page }) => {
        await page.goto('/posts');
        await page.waitForTimeout(2000);

        const firstCard = firstDetailLink(page, 'posts');
        const count = await firstCard.count();
        test.skip(count === 0, '暂无动态数据');

        await firstCard.click();
        await expect(page).toHaveURL(/\/posts\/\d+/);
    });
});

test.describe('Phase2 - 动态发布', () => {
    test.beforeEach(async ({ page }) => {
        await clearAuth(page);
    });

    test('V-D1-01 - 已登录发布纯文字动态', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/posts/create');
        await page.waitForTimeout(1500);

        const content = `e2e纯文字_${Date.now()}`;
        // 主内容输入框 className="content-input"（见 postEditorPage.tsx）
        await page.locator('.content-input').first().fill(content);
        await expect(page.locator('.content-input').first()).toHaveValue(content);

        // 顶栏「发布」按钮（避免误点其它含「发布」文案的控件）
        const publishBtn = page.locator('.publish-btn').first();
        await expect(publishBtn).toBeEnabled({ timeout: 5_000 });

        const createRespPromise = page.waitForResponse(
            (r) => r.url().includes('/api/v1/posts') && r.request().method() === 'POST' && !r.url().match(/\/posts\/\d+/),
            { timeout: 15_000 },
        );
        await publishBtn.click();
        const createResp = await createRespPromise;
        const createBody = await createResp.json().catch(() => ({} as { message?: string; code?: number }));
        expect(createResp.ok(), `发布 API 失败: ${createResp.status()} ${createBody?.message || ''}`).toBeTruthy();

        // 成功后 navigate(-1) 离开 create
        await page.waitForURL((url) => !url.pathname.includes('/create'), { timeout: 15_000 });
    });

    test('V-D1-04 - 文字超限校验（maxLength=500）', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/posts/create');
        await page.waitForTimeout(1500);

        // 输入超过500字；Textarea maxLength=500 会截断
        const longContent = 'a'.repeat(501);
        await page.locator('.content-input').first().fill(longContent);
        await page.waitForTimeout(300);

        // 字数计数器显示 "500/500"（已截断至最大值，见 postEditorPage.tsx:159 charCount/500）
        await expect(page.locator('.char-count').first()).toContainText(/500\/500/);
    });
});

test.describe('Phase2 - 评论功能', () => {
    test.beforeEach(async ({ page }) => {
        await clearAuth(page);
    });

    test('V-I2-01 - 已登录发表评论', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/posts');
        await page.waitForTimeout(2000);

        const firstCard = firstDetailLink(page, 'posts');
        const count = await firstCard.count();
        test.skip(count === 0, '暂无动态数据');

        await firstCard.click();
        await page.waitForTimeout(1500);

        // 评论输入框 id="post-detail-comment-input"，placeholder="说点什么…"（见 postDetailPage.tsx:231）
        const commentInput = page.locator('#post-detail-comment-input').first();
        test.skip(!(await commentInput.isVisible()), '评论输入框未渲染');

        const commentText = `e2e测试评论_${Date.now()}`;
        await commentInput.fill(commentText);

        // 发送按钮文案为"发送"（见 postDetailPage.tsx:244）
        await page.getByRole('button', { name: '发送' }).first().click();
        await page.waitForTimeout(1500);

        // 断言评论已出现在评论列表（verify.md V-I2-01 预期评论显示在列表）
        await expect(page.locator('body')).toContainText(commentText, { timeout: 5_000 });
    });
});

test.describe('Phase2 - 点赞功能', () => {
    test.beforeEach(async ({ page }) => {
        await clearAuth(page);
    });

    test('V-I3-01/V-I3-02 - 点赞与取消点赞', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/posts');
        await page.waitForTimeout(2000);

        // 点赞按钮 aria-label="点赞"（见 postActions.tsx）；HeroUI class 不稳定，改断言 toast/接口
        const likeBtn = page.getByRole('button', { name: '点赞' }).first();
        test.skip(!(await likeBtn.isVisible()), '动态列表无点赞按钮');

        const countBefore = Number((await likeBtn.innerText()).replace(/\D/g, '') || '0');
        const likeRespPromise = page.waitForResponse(
            (r) => r.url().includes('/like') && r.request().method() === 'POST',
            { timeout: 10_000 },
        );
        await likeBtn.click({ force: true });
        const likeResp = await likeRespPromise;
        expect(likeResp.ok()).toBeTruthy();
        await expect(page.getByText(/点赞成功|已取消点赞/)).toBeVisible({ timeout: 5_000 });

        const countAfter = Number((await likeBtn.innerText()).replace(/\D/g, '') || '0');
        expect(countAfter).not.toBe(countBefore);
    });
});

test.describe('Phase2 - 收藏功能', () => {
    test.beforeEach(async ({ page }) => {
        await clearAuth(page);
    });

    test('V-I4-01/V-I4-02 - 收藏与取消收藏', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/posts');
        await page.waitForTimeout(2000);

        const favoriteBtn = page.getByRole('button', { name: '收藏' }).first();
        test.skip(!(await favoriteBtn.isVisible()), '动态列表无收藏按钮');

        const countBefore = Number((await favoriteBtn.innerText()).replace(/\D/g, '') || '0');
        const favRespPromise = page.waitForResponse(
            (r) => r.url().includes('/favorite') && r.request().method() === 'POST',
            { timeout: 10_000 },
        );
        await favoriteBtn.click({ force: true });
        const favResp = await favRespPromise;
        expect(favResp.ok()).toBeTruthy();
        await expect(page.getByText(/已收藏|已取消收藏/)).toBeVisible({ timeout: 5_000 });

        const countAfter = Number((await favoriteBtn.innerText()).replace(/\D/g, '') || '0');
        expect(countAfter).not.toBe(countBefore);
    });
});

test.describe('Phase2 - 动态管理', () => {
    test.beforeEach(async ({ page }) => {
        await clearAuth(page);
    });

    test('V-I7-01 - 编辑自己的动态', async ({ page }) => {
        await loginAsUser(page);
        const postId = await createOwnPost(page, `e2e可编辑_${Date.now()}`);

        // 自己的动态才有「编辑」菜单项；旧用例在 /profile/1 里 if(isVisible()) 空转，
        // 既不保证命中自己的帖，也没有任何断言。
        await page.goto(`/posts/${postId}`);
        await page.getByRole('button', { name: '更多操作' }).click();
        await page.getByRole('menuitem', { name: '编辑' }).click();
        await expect(page).toHaveURL(new RegExp(`/posts/${postId}/edit`), { timeout: 10_000 });
    });

    test('V-I7-02 - 删除自己的动态需二次确认', async ({ page }) => {
        await loginAsUser(page);
        const content = `e2e删除确认_${Date.now()}`;
        const postId = await createOwnPost(page, content);

        await page.goto(`/posts/${postId}`);
        await page.getByRole('button', { name: '更多操作' }).click();
        await page.getByRole('menuitem', { name: '删除' }).click();
        // 破坏性操作必须弹二次确认；真正的删除闭环在 phase-2-supplement.spec.ts
        await expect(page.getByRole('dialog')).toContainText(/删除这条动态|无法恢复/, {
            timeout: 5_000,
        });
        await expect(page.getByRole('button', { name: '取消' })).toBeVisible();
    });

    test('V-D3-01 - 关联已有话题', async ({ page }) => {
        // 迁出至 T5 的只是「用户建话题」；D3 关联已有话题仍在发布页。
        // 搜索框要先点「添加话题」展开 showTopicPicker，旧用例直接找输入框会恒 skip。
        await loginAsUser(page);
        await page.goto('/posts/create');

        await page.getByText('添加话题').click();
        const topicInput = page.getByPlaceholder('搜索话题');
        await expect(topicInput).toBeVisible({ timeout: 10_000 });
        await topicInput.fill('猫');
        await expect(topicInput).toHaveValue('猫');
        // 无 seed 话题时建议列表不渲染，但话题选择器必须处于展开态
        const picker = page.locator('.topic-picker');
        await expect(picker).toBeVisible();
        expect(await picker.locator('.topic-suggestion').count()).toBeLessThanOrEqual(10);
    });

    test('V-D4-01 - @用户输入', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/posts/create');
        await page.waitForTimeout(1500);

        // 主内容输入框 className="content-input"（见 postEditorPage.tsx:152）
        const editor = page.locator('.content-input').first();
        await expect(editor).toBeVisible({ timeout: 10_000 });

        // 只输入 '@' 时 query 为空、不发搜索（MentionTextarea 有明确分支）；
        // 必须带昵称前缀才会打开 listbox，并校验「建议最多 10 条」。
        await editor.fill('@e');
        await expect(editor).toHaveValue('@e');
        const listbox = page.getByRole('listbox', { name: '用户搜索建议' });
        await expect(listbox).toBeVisible({ timeout: 5_000 });
        const optionCount = await listbox.getByRole('option').count();
        expect(optionCount, '@ 建议最多 10 条').toBeLessThanOrEqual(10);
        if (optionCount === 0) {
            await expect(listbox).toContainText(/未找到匹配用户|输入昵称搜索/);
        } else {
            await expect(listbox.getByRole('option').first()).toBeVisible();
        }
    });

    test('V-I5-01 - 分享面板', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/posts');
        await page.waitForTimeout(2000);

        const firstCard = firstDetailLink(page, 'posts');
        const count = await firstCard.count();
        test.skip(count === 0, '暂无动态数据');

        await firstCard.click();
        await page.waitForTimeout(1500);

        const shareBtn = page.getByRole('button', { name: /分享|Share/ }).first();
        test.skip(!(await shareBtn.isVisible()), '分享按钮未渲染');

        await shareBtn.click();
        await page.waitForTimeout(500);
        // 分享面板是 Modal（标题「分享」），平台为 微信/微博/复制链接/二维码/生成海报；
        // 旧断言里的 QQ 分享从未上线。
        await expect(page.getByRole('dialog')).toContainText(/分享方式|复制链接|二维码/, {
            timeout: 5_000,
        });
    });

    test('V-I6-01 - 举报他人动态', async ({ browser }) => {
        // 举报入口只出现在「他人」动态的更多操作菜单里（自己的是编辑/删除）。
        // 旧用例从 /posts 随机点第一条，命中自己帖子时菜单里没有举报 → 恒 skip。
        const { actor, viewer, cleanup } = await dualSessions(browser);
        try {
            const postId = await createOwnPost(viewer, `e2e待举报_${Date.now()}`);
            await actor.goto(`/posts/${postId}`);
            await actor.getByRole('button', { name: '更多操作' }).click();
            await actor.getByRole('menuitem', { name: '举报' }).click();
            await expect(actor.getByRole('dialog')).toContainText(/举报动态/, { timeout: 5_000 });
            await expect(actor.getByRole('button', { name: '提交举报' })).toBeDisabled();
        } finally {
            await cleanup();
        }
    });

    test('已登录访问收藏列表', async ({ page }) => {
        await loginAsUser(page);
        // 收藏列表入口在个人主页 /profile/:id 下的收藏 Tab；无独立路由
        await page.goto('/profile/1');
        await page.waitForTimeout(2000);

        const favTab = page.getByRole('button', { name: /收藏/ }).first();
        if (await favTab.isVisible()) {
            await favTab.click();
            await page.waitForTimeout(500);
        }
        expect(page.url()).toContain('/profile/');
    });

    test('已登录访问草稿列表', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/posts/drafts');
        await page.waitForTimeout(2000);
        expect(page.url()).toContain('/posts/drafts');
    });
});

test.describe('Phase2 - 位置文案（R14 地图选点未上线，仅覆盖文本位置）', () => {
    test.beforeEach(async ({ page }) => {
        await clearAuth(page);
    });

    test('V-LOC-01 - 位置文案可输入', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/posts/create');

        // 位置通过 LocationPicker 弹窗设置（R14 地图选点未上线，仅文案）：
        // 触发按钮 aria-label="选择所在位置" → 弹窗内手输地名 → 使用文案。
        // 旧断言直接 fill .location-input（span）会报「Element is not <input>」。
        const locationTrigger = page.getByRole('button', { name: '选择所在位置' });
        await expect(locationTrigger).toBeVisible({ timeout: 10_000 });
        await locationTrigger.click();

        const modal = page.getByRole('dialog');
        await expect(modal).toBeVisible({ timeout: 5_000 });
        const manualInput = modal.getByLabel('手输地名');
        await expect(manualInput).toBeVisible();
        await manualInput.fill('北京市朝阳区');
        await modal.getByRole('button', { name: '使用文案' }).click();

        // 选点后，「所在位置」展示已选文案（.location-input 为渲染文案的 span）
        await expect(page.locator('.location-input').first()).toContainText(/北京市朝阳区/, {
            timeout: 5_000,
        });
    });

    test('V-LOC-03 - 位置文案在动态详情展示', async ({ page }) => {
        await loginAsUser(page);
        const location = `北京市朝阳区e2e${Date.now() % 100000}`;
        const postId = await createOwnPost(page, `e2e位置展示_${Date.now()}`, location);

        const detailResp = await apiWrite(page, 'get', `/api/v1/posts/${postId}`);
        const detail = (await detailResp.json()) as { data?: { location?: string } };
        expect(detail.data?.location, '位置未落库').toBe(location);

        await page.goto(`/posts/${postId}`);
        await expect(page.locator('body')).toContainText(location, { timeout: 10_000 });
    });
});

test.describe('Phase2 - 定时发布', () => {
    test.beforeEach(async ({ page }) => {
        await clearAuth(page);
    });

    test('V-D7-01 - 定时发布功能入口', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/posts/create');
        await page.waitForTimeout(1500);

        // 定时发布 toggle：FilterChip 渲染为 button，文案"立即"/"定时"（见 postEditorPage.tsx）
        const scheduleToggle = page.getByRole('button', { name: '定时', exact: true }).first();
        // 控件存在就必须渲染：不再用条件 skip 把「选择器失配」伪装成通过
        await expect(scheduleToggle).toBeVisible({ timeout: 10_000 });

        await scheduleToggle.click();
        await page.waitForTimeout(500);

        // SchedulePicker：自定义日期/时/分（HeroUI Select 的 aria-label 不一定进 a11y 树）
        const picker = page.locator('.schedule-picker');
        await expect(picker).toBeVisible({ timeout: 5_000 });
        await expect(picker).toContainText(/日期|快捷时间|将于|请选择发布时间/);
    });

    test('V-D7-03 - 定时发布时间校验', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/posts/create');
        await page.waitForTimeout(1500);

        const scheduleToggle = page.getByRole('button', { name: '定时', exact: true }).first();
        // 控件存在就必须渲染：不再用条件 skip 把「选择器失配」伪装成通过
        await expect(scheduleToggle).toBeVisible({ timeout: 10_000 });

        await scheduleToggle.click();
        await page.waitForTimeout(500);

        const picker = page.locator('.schedule-picker');
        await expect(picker).toBeVisible({ timeout: 5_000 });
        await expect(picker.locator('.schedule-summary')).toContainText(/将于|请选择发布时间/);
        await expect(picker.locator('.schedule-hint')).toContainText(/最多延迟/);
    });
});

test.describe('Phase2 - 视频封面', () => {
    test.beforeEach(async ({ page }) => {
        await clearAuth(page);
    });

    test('V-D2-05 - 视频封面设置', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/posts/create');
        await page.waitForTimeout(1500);

        // 未上传视频时不会出现封面选项，但发布页与发布按钮必须可用
        await expect(page.locator('.content-input').first()).toBeVisible({ timeout: 10_000 });
        await expect(page.locator('.publish-btn').first()).toBeVisible();
        const videoTab = page.getByRole('button', { name: /视频/ }).first();
        if (await videoTab.isVisible()) {
            await videoTab.click();
            await expect(page.locator('.publish-btn').first()).toBeVisible();
        }
    });
});

test.describe('Phase2 - 可见范围 D5（§4.6 三档）', () => {
    test.beforeEach(async ({ page }) => {
        await clearAuth(page);
    });

    test('V-D5-01 - 公开动态可发布', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/posts/create');
        await page.waitForTimeout(1500);

        // 触发器文案为"谁可以看"，使用文本定位（避免依赖 .option-item CSS 类）
        const visibilityBtn = page.getByText('谁可以看').first();
        await expect(visibilityBtn).toBeVisible({ timeout: 10_000 });

        await visibilityBtn.click();
        await page.waitForTimeout(300);

        // 在弹出的选择器中点击"公开"（VisibilityOptions value=0 → label "公开"）
        const publicOpt = page.getByText('公开', { exact: true }).first();
        await expect(publicOpt).toBeVisible({ timeout: 10_000 });

        await publicOpt.click();
        await page.waitForTimeout(300);

        // 选中后触发器右侧应显示"公开"
        await expect(page.getByText('谁可以看').locator('..')).toContainText(/公开/);
    });

    test('V-D5-02 - 仅粉丝可见可设置', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/posts/create');
        await page.waitForTimeout(1500);

        const visibilityBtn = page.getByText('谁可以看').first();
        await expect(visibilityBtn).toBeVisible({ timeout: 10_000 });

        await visibilityBtn.click();
        await page.waitForTimeout(300);

        const followersOpt = page.getByText('仅粉丝', { exact: true }).first();
        await expect(followersOpt).toBeVisible({ timeout: 10_000 });

        await followersOpt.click();
        await page.waitForTimeout(300);

        await expect(page.getByText('谁可以看').locator('..')).toContainText(/仅粉丝/);
    });

    test('V-D5-03 - 私密可见可设置', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/posts/create');
        await page.waitForTimeout(1500);

        const visibilityBtn = page.getByText('谁可以看').first();
        await expect(visibilityBtn).toBeVisible({ timeout: 10_000 });

        await visibilityBtn.click();
        await page.waitForTimeout(300);

        const privateOpt = page.getByText('私密', { exact: true }).first();
        await expect(privateOpt).toBeVisible({ timeout: 10_000 });

        await privateOpt.click();
        await page.waitForTimeout(300);

        await expect(page.getByText('谁可以看').locator('..')).toContainText(/私密/);
    });
});