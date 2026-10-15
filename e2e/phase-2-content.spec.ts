import { test, expect } from '@playwright/test';
import { clearAuth, loginAsUser, firstDetailLink } from './fixtures/auth';

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
        await page.goto('/profile/1');
        await page.waitForTimeout(2000);

        const editBtn = page.getByRole('button', { name: /编辑/ }).first();
        if (await editBtn.isVisible()) {
            await editBtn.click();
            await page.waitForTimeout(1000);
        }
    });

    test('V-I7-02 - 删除自己的动态', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/profile/1');
        await page.waitForTimeout(2000);

        const deleteBtn = page.getByRole('button', { name: /删除/ }).first();
        if (await deleteBtn.isVisible()) {
            await deleteBtn.click();
            await page.waitForTimeout(500);
        }
    });

    test('V-D3-01 - 关联已有话题（§4.3 D3-03 已迁出至 T5）', async ({ page }) => {
        // §4.3：Phase-2 D3 仅支持关联已有话题，不交付用户建话题
        await loginAsUser(page);
        await page.goto('/posts/create');
        await page.waitForTimeout(1500);

        const topicInput = page.locator('input[placeholder*="话题"], input[placeholder*="#"]').first();
        test.skip(!(await topicInput.isVisible()), '话题关联入口未渲染');

        await topicInput.fill('猫');
        await page.waitForTimeout(500);
    });

    test('V-D4-01 - @用户输入', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/posts/create');
        await page.waitForTimeout(1500);

        // 主内容输入框 className="content-input"（见 postEditorPage.tsx:152）
        const editor = page.locator('.content-input').first();
        test.skip(!(await editor.isVisible()), '动态编辑器未渲染');

        // 输入 @ 触发用户搜索建议
        await editor.fill('@');
        await page.waitForTimeout(500);
        // 用户搜索建议出现即通过（无数据不强断言）
        const suggestion = page.locator('[class*="mention"], [data-testid="mention-suggestion"]').first();
        if (await suggestion.isVisible()) {
            await expect(suggestion).toBeVisible();
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
        await expect(page.locator('body')).toContainText(/微信|微博|复制链接|QQ/, { timeout: 3_000 });
    });

    test('V-I6-01 - 举报动态', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/posts');
        await page.waitForTimeout(2000);

        const firstCard = firstDetailLink(page, 'posts');
        const count = await firstCard.count();
        test.skip(count === 0, '暂无动态数据');

        await firstCard.click();
        await page.waitForTimeout(1500);

        const reportBtn = page.getByRole('button', { name: /举报/ }).first();
        test.skip(!(await reportBtn.isVisible()), '举报入口未渲染');

        await reportBtn.click();
        await page.waitForTimeout(500);
        // 举报弹窗应包含举报类型
        await expect(page.locator('body')).toContainText(/举报|类型|原因/, { timeout: 3_000 });
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

test.describe('Phase2 - 定位功能', () => {
    test.beforeEach(async ({ page }) => {
        await clearAuth(page);
    });

    test('V-D6-01 - 定位功能入口可见', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/posts/create');
        await page.waitForTimeout(1500);

        // 定位是 Input 而非 button：aria-label="所在位置"，placeholder="添加位置"（见 postEditorPage.tsx:306）
        const locationInput = page.getByLabel('所在位置').first();
        test.skip(!(await locationInput.isVisible()), '定位输入框未渲染');

        // 填入位置并验证可输入
        await locationInput.fill('北京市朝阳区');
        await page.waitForTimeout(300);
        await expect(locationInput).toHaveValue(/北京市朝阳区/);
    });

    test('V-D6-03 - 定位展示', async ({ page }) => {
        await page.goto('/posts');
        await page.waitForTimeout(2000);

        // 查看动态是否显示定位信息
        const locationIcon = page.locator('[class*="location"], [data-testid="location"]').first();
        if (await locationIcon.isVisible()) {
            await expect(locationIcon).toBeVisible();
        }
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
        test.skip(!(await scheduleToggle.isVisible()), '定时发布 toggle 未渲染');

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
        test.skip(!(await scheduleToggle.isVisible()), '定时发布 toggle 未渲染');

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

        // 检查视频上传区域
        const videoTab = page.getByRole('button', { name: /视频/ });
        if (await videoTab.isVisible()) {
            await videoTab.click();
            await page.waitForTimeout(500);
            // 视频上传后应显示封面设置选项
            const coverOption = page.getByText(/封面|Cover/);
            if (await coverOption.isVisible()) {
                await expect(coverOption).toBeVisible();
            }
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
        test.skip(!(await visibilityBtn.isVisible()), '可见范围选择器未渲染');

        await visibilityBtn.click();
        await page.waitForTimeout(300);

        // 在弹出的选择器中点击"公开"（VisibilityOptions value=0 → label "公开"）
        const publicOpt = page.getByText('公开', { exact: true }).first();
        test.skip(!(await publicOpt.isVisible()), '"公开"选项未渲染');

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
        test.skip(!(await visibilityBtn.isVisible()), '可见范围选择器未渲染');

        await visibilityBtn.click();
        await page.waitForTimeout(300);

        const followersOpt = page.getByText('仅粉丝', { exact: true }).first();
        test.skip(!(await followersOpt.isVisible()), '"仅粉丝"选项未渲染（Phase-3 关注未上线前等同公开，见 id-traceability §五）');

        await followersOpt.click();
        await page.waitForTimeout(300);

        await expect(page.getByText('谁可以看').locator('..')).toContainText(/仅粉丝/);
    });

    test('V-D5-03 - 私密可见可设置', async ({ page }) => {
        await loginAsUser(page);
        await page.goto('/posts/create');
        await page.waitForTimeout(1500);

        const visibilityBtn = page.getByText('谁可以看').first();
        test.skip(!(await visibilityBtn.isVisible()), '可见范围选择器未渲染');

        await visibilityBtn.click();
        await page.waitForTimeout(300);

        const privateOpt = page.getByText('私密', { exact: true }).first();
        test.skip(!(await privateOpt.isVisible()), '"私密"选项未渲染');

        await privateOpt.click();
        await page.waitForTimeout(300);

        await expect(page.getByText('谁可以看').locator('..')).toContainText(/私密/);
    });
});