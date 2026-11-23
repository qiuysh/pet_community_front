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
});
