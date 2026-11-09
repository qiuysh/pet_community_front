/**
 * UI 设计规范文档漂移守卫。
 *
 * 目的：批次 1/2 修掉的「示例硬编码 hex、emoji 图标、自写骨架屏 keyframes、
 * 字号表脱离 token 阶梯、虚构 12 列栅格」不再回到文档里。
 * 依据：docs/frontend/ui-spec-review-2026-11-06.md（P1）+ ui-design-spec.md v2.5。
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// vitest 的 cwd 固定为 front/；文档在仓库 docs/ 下，需退回一级。
const read = (rel: string) => readFileSync(resolve(process.cwd(), rel), 'utf-8');
const spec = read('../docs/frontend/ui-design-spec.md');
const variablesSource = read('src/styles/_variables.scss');

/** 取 `### <编号>` 小节正文（到下一个 ## / ### 标题前） */
function section(id: string): string {
  const heading = new RegExp(`^### ${id.replace(/\./g, '\\.')}[^\\n]*\\n`, 'm');
  const match = heading.exec(spec);
  if (!match) throw new Error(`ui-design-spec.md 缺少 ${id} 小节`);
  const rest = spec.slice(match.index + match[0].length);
  const next = /^#{2,3} /m.exec(rest);
  return next ? rest.slice(0, next.index) : rest;
}

/** 取两个二级标题之间的正文 */
function chapter(start: string, end: string): string {
  const from = spec.indexOf(start);
  const to = spec.indexOf(end, from);
  if (from < 0 || to < 0) throw new Error(`ui-design-spec.md 缺少章节 ${start} / ${end}`);
  return spec.slice(from, to);
}

/** 拼接全文所有 fenced code block 的内容 */
function codeBlocks(): string {
  return [...spec.matchAll(/```[^\n]*\n([\s\S]*?)```/g)].map((m) => m[1]).join('\n');
}

const EMOJI = /[\u2190-\u21FF\u2600-\u27BF\u{1F300}-\u{1FAFF}]/u;

describe('UI 设计规范与代码一致', () => {
  it('版本号与四处 Token 落点已登记', () => {
    expect(spec).toMatch(/\*\*版本\*\*\s*\|\s*v2\.5/);
    expect(spec).toContain('`front/src/styles/app.css`');
    expect(spec).toContain('`front/tailwind.config.js`');
  });

  it('示例代码不含裸 hex / transition: all / 自写 @keyframes', () => {
    const blocks = codeBlocks();
    expect(blocks).not.toMatch(/#[0-9A-Fa-f]{3,8}\b/);
    expect(blocks).not.toMatch(/transition:\s*all/);
    expect(blocks).not.toContain('@keyframes');
  });

  it('3.2 字号表与 $font-size-* 阶梯一一对应', () => {
    const ladder = [...variablesSource.matchAll(/^\$font-size-[\w-]+:\s*(\d+)px;/gm)].map((m) =>
      Number(m[1]),
    );
    const documented = [...section('3.2').matchAll(/\|\s*(\d+)px\s*\|/g)].map((m) => Number(m[1]));
    expect(ladder.length).toBeGreaterThan(0);
    expect(documented.sort((a, b) => a - b)).toEqual(ladder.sort((a, b) => a - b));
    // 旧的「Body 1 = 16px」不得回潮
    const body = section('3.2');
    expect(body).toContain('$font-size-base');
    expect(body).toContain('15px');
    expect(body).not.toMatch(/Body 1\s*\|\s*16px/);
  });

  it('3.4 间距表带 SCSS Token 映射', () => {
    expect(section('3.4')).toContain('$spacing-lg');
    expect(section('3.4')).toContain('$spacing-sm');
  });

  it('4.3 输入框示例只用 Token，并给出表单反馈闭环', () => {
    const body = section('4.3');
    expect(body).toContain('$primary-text');
    expect(body).toContain('$error-text');
    expect(body).toContain('aria-invalid');
    expect(body).toContain('role="alert"');
    // 正文可以拿废弃色值当反例，代码块里一个裸 hex 都不能有
    const blocks = [...body.matchAll(/```[^\n]*\n([\s\S]*?)```/g)].map((m) => m[1]).join('\n');
    expect(blocks).not.toMatch(/#[0-9A-Fa-f]{3,8}\b/);
  });

  it('5.1 / 5.3 描述真实 UserLayout，不再有 Sidebar 与 12 列栅格', () => {
    expect(section('5.1')).toContain('没有左侧 Sidebar');
    expect(section('5.1')).toContain('UserTabBar');
    expect(spec).toMatch(/^### 5\.3[^\n]*不存在 12 列栅格/m);
    const grid = section('5.3');
    expect(grid).toContain('$content-max');
    expect(grid).toContain('$page-max-read');
    // 旧表的「移动端/平板/桌面 × 12 列 × 90%」不得回潮
    expect(grid).not.toMatch(/\|\s*平板\s*\|\s*12\s*\|/);
    expect(grid).not.toMatch(/采用 12 列栅格系统/);
  });

  it('6.1 引用 motion-spec，6.2 用 Lucide 图标，6.3 指向骨架屏适配层', () => {
    expect(section('6.1')).toContain('motion-spec.md');
    expect(section('6.1')).toContain('_motion.scss');
    const feedback = section('6.2');
    expect(feedback).toContain('CheckCircle2');
    expect(feedback).toContain('$success-text');
    expect(EMOJI.test(feedback)).toBe(false);
    expect(section('6.3')).toContain('components/ui/skeleton.tsx');
  });

  it('7 页面示例为纯示意且不含 emoji，8.1 图标库只剩 Lucide', () => {
    const examples = chapter('## 七、页面风格示例', '## 八、设计资源');
    expect(examples).toContain('纯示意');
    expect(EMOJI.test(examples)).toBe(false);
    const icons = section('8.1');
    expect(icons).toContain('lucide-react');
    expect(icons).not.toMatch(/\|\s*Feather Icons\s*\|/);
    expect(icons).not.toMatch(/\|\s*Ant Design Icons\s*\|/);
  });
});
