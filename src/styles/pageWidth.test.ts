/**
 * 同页同宽回归守卫（.ai/design/design-system.md §5.3 / §5.5、.ai/core/frontend.md）。
 *
 * 规范：水平留白由外壳提供，正文容器层不得再加左右 padding 去「凑」页头宽度；
 * 正文内容块应直接铺满 %page-shell 的 1120 列宽，与页头同宽（同左边缘）。
 * 卡片自身的内边距（如 .topic-card 的 $spacing-md）属于卡片内部，不在本守卫范围。
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// vitest 的 cwd 固定为 front/，与 styles/contrast.test.ts 同范式。
const read = (rel: string) => readFileSync(resolve(process.cwd(), rel), 'utf-8');

interface Block {
  decls: string[];
  inMedia: boolean;
}

/** 该位置是否处于 @media 块内 */
function detectInMedia(before: string): boolean {
  const mediaRe = /@media[^{]*\{/g;
  let m: RegExpExecArray | null;
  let lastMediaEnd = -1;
  while ((m = mediaRe.exec(before)) !== null) lastMediaEnd = m.index + m[0].length;
  if (lastMediaEnd < 0) return false;
  let depth = 0;
  for (let i = lastMediaEnd; i < before.length; i++) {
    const ch = before[i];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
  }
  return depth > 0;
}

/** 扫描 scss 中某选择器的所有块（含 media query 内的同名块），记录直接声明 */
function blocks(source: string, selector: string): Block[] {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`${escaped}\\s*\\{`, 'g');
  const out: Block[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(source)) !== null) {
    const inMedia = detectInMedia(source.slice(0, m.index));
    const decls: string[] = [];
    let depth = 1;
    for (const line of source.slice(m.index + m[0].length).split('\n')) {
      if (depth === 1 && !line.trimStart().startsWith('//')) decls.push(line.trim());
      for (const ch of line) {
        if (ch === '{') depth++;
        else if (ch === '}') depth--;
      }
      if (depth <= 0) break;
    }
    out.push({ decls, inMedia });
  }
  return out;
}

/** 取整块原文（含嵌套 media），用于断言媒体查询内的声明 */
function blockText(source: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = new RegExp(`${escaped}\\s*\\{`).exec(source);
  if (!m) return '';
  let depth = 1;
  let i = m.index + m[0].length;
  for (; i < source.length && depth > 0; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') depth--;
  }
  return source.slice(m.index, i);
}

/** padding 简写是否带水平分量：1 值即水平；2/3/4 值的第 2 个为水平 */
function hasHorizontalPadding(value: string): boolean {
  const parts = value.trim().split(/\s+/);
  return parts.length === 1 ? parts[0] !== '0' : parts[1] !== '0';
}

/**
 * 正文容器层不得设置水平 padding。
 * 允许：padding-block / padding-top / padding-bottom / padding-bottom(token)；
 * 禁止：padding(x y) 里 y≠0、padding-inline、padding-left/right。
 */
function expectNoHorizontalPadding(source: string, selector: string): void {
  const found = blocks(source, selector);
  expect(found.length, `${selector} 应有样式块`).toBeGreaterThan(0);
  for (const block of found) {
    for (const decl of block.decls) {
      if (/^padding-(inline|left|right)\s*:/.test(decl)) {
        throw new Error(`${selector} 不得写水平 padding（§5.3）：${decl}`);
      }
      const hit = decl.match(/^padding\s*:\s*([^;]+);/);
      if (hit && hasHorizontalPadding(hit[1])) {
        throw new Error(`${selector} 的 padding 不得带水平分量（§5.3）：${decl}`);
      }
    }
  }
}

describe('同页同宽：正文容器层无左右 padding，内容块铺满列宽（§5.3 / §5.5）', () => {
  it('/topics 的 .topic-list 无水平 padding，卡片铺满 1120', () => {
    expectNoHorizontalPadding(read('src/pages/topic/topicListPage.scss'), '.topic-list');
  });

  it('/posts/:id 的根容器无水平 padding，正文白卡铺满 1120', () => {
    // 卡片内 16px padding 属于卡片内部（用户确认保留），只守根容器层。
    expectNoHorizontalPadding(read('src/pages/post/postDetailPage.scss'), '.post-detail-page');
  });

  it('列表 / 发现 / 社交页正文容器无水平 padding，卡片铺满 1120', () => {
    const cases: Array<[file: string, selector: string]> = [
      ['src/pages/discovery/categoryPage.scss', '.posts-list'],
      ['src/pages/discovery/searchPage.scss', '.search-content'],
      ['src/pages/discovery/searchPage.scss', '.search-result'],
      ['src/pages/discovery/rankingPage.scss', '.ranking-main'],
      ['src/pages/discovery/topicSquarePage.scss', '.section'],
      ['src/pages/social/followListPage.scss', '.user-list'],
      ['src/pages/social/messageListPage.scss', '.conversation-list'],
      ['src/pages/social/newMessagePage.scss', '.follow-list-section'],
      ['src/pages/social/newMessagePage.scss', '.compose-section'],
      ['src/pages/social/notificationListPage.scss', '.notification-list'],
      ['src/pages/social/notificationSettingsPage.scss', '.settings-list'],
      ['src/pages/social/pointsPage.scss', '.points-main'],
    ];
    for (const [file, selector] of cases) {
      expectNoHorizontalPadding(read(file), selector);
    }
  });

  it('聊天 / 签到等 bare 路由用 %page-bare-shell，内容列同为 1120', () => {
    const variables = read('src/styles/_variables.scss');
    expect(variables).toContain('%page-bare-shell');
    expect(variables).not.toContain('$page-max-read');
    expect(read('src/styles/global.scss')).not.toContain('page-shell--read');

    const chat = read('src/pages/social/chatPage.scss');
    expect(chat).toContain('@extend %page-bare-shell');
    expect(chat).not.toContain('$page-max-read');

    expect(read('src/pages/activity/activitySignInPage.scss')).toContain('@extend %page-bare-shell');
    const signIn = read('src/pages/activity/activitySignInPage.tsx');
    expect(signIn).toContain('sign-in-shell');
    expect(signIn).not.toContain('page-shell px-4');
  });

  it('前台加载骨架与 404 页无水平 padding，列宽同为 1120', () => {
    const skeleton = read('src/router/lazyPage.tsx');
    expect(skeleton).toContain('page-shell w-full');
    expect(skeleton).not.toContain('page-shell px-4');

    const notFound = read('src/pages/error/notFoundPage.tsx');
    expect(notFound).toContain('page-shell');
    expect(notFound).not.toContain('px-4');
  });

  it('所有页头 / 页脚盒宽 = 内容 + 内边距 = 1120', () => {
    const variables = read('src/styles/_variables.scss');
    expect(variables).toContain('$shell-inner-max: $page-max;');
    // bare 外壳的 1168 是「内容列 + 两侧留白」，不得再当页头盒宽用。
    expect(variables).toContain('$bare-shell-max: $page-max + $spacing-lg * 2;');
    expect(variables).toContain('max-width: $bare-shell-max;');

    const layout = read('src/components/layout/userLayout.scss');
    for (const selector of ['.header-content', '.site-footer-inner']) {
      const widths = blocks(layout, selector).flatMap((block) => block.decls);
      expect(widths.length, `${selector} 应有样式块`).toBeGreaterThan(0);
      expect(
        widths.some((decl) => /^max-width:\s*\$shell-inner-max;/.test(decl)),
        `${selector} 的 max-width 必须用 $shell-inner-max`,
      ).toBe(true);
    }

    // 顶部导航精确口径：盒宽 1120 = 内容 + 盒内 padding（PC 24 / 移动 12）。
    // 三要素缺一不可：盒宽 token + padding token + border-box（padding 计入盒宽）。
    const nav = blockText(layout, '.header-content');
    expect(nav).toMatch(/padding:\s*0 \$spacing-lg;/);
    expect(nav).toMatch(/padding:\s*0 \$spacing-sm;/);
    expect(read('src/styles/global.scss')).toMatch(/box-sizing:\s*border-box/);

    // 页面内页头沿用 page-shell + px-4，盒宽同为 1120。
    expect(read('src/components/ui/pageHeader.tsx')).toContain('page-shell px-4');
    // bare 签到页的标题层 / 页签条也必须是 1120 盒宽，不能再套 1168 的 sign-in-shell。
    const signInStyle = read('src/pages/activity/activitySignInPage.scss');
    expect(signInStyle).toContain('.sign-in-header');
    expect(signInStyle).toContain('@extend %page-shell');
    const signIn = read('src/pages/activity/activitySignInPage.tsx');
    expect(signIn.match(/className="sign-in-header"/g)?.length).toBe(2);
    expect(signIn.match(/className="sign-in-shell(?: |")/g)?.length).toBe(1);
  });
});
