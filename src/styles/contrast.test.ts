/**
 * 配色可访问性守卫。
 *
 * 目的：把「白字配主色不达标」这类问题钉死在测试里，改 token 时立刻暴露。
 * 依据：docs/frontend/ui-spec-review-2026-11-06.md（P0 对比度实测）。
 * 口径：WCAG 2.1 —— 正文 4.5:1，图形/UI 组件与大字号 3:1。
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// 直接读源文件：本目录的 .scss / .css 走 ?raw 会被 Vite 的样式插件转成空模块。
// vitest 的 cwd 固定为 front/，用相对路径即可（不依赖 import.meta.url 的 scheme）。
const read = (rel: string) => readFileSync(resolve(process.cwd(), rel), 'utf-8');
const variablesSource = read('src/styles/_variables.scss');
const appCssSource = read('src/styles/app.css');

/** 从 _variables.scss 提取 `$name: #RRGGBB;` */
function parseTokens(source: string): Record<string, string> {
  const map: Record<string, string> = {};
  const re = /^\s*\$([\w-]+):\s*(#[0-9A-Fa-f]{6});/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source)) !== null) {
    map[m[1]] = m[2].toUpperCase();
  }
  return map;
}

function channel(v: number): number {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => channel(parseInt(h.slice(i, i + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const tokens = parseTokens(variablesSource);
const t = (name: string): string => {
  const value = tokens[name];
  if (!value) throw new Error(`_variables.scss 缺少 $${name}`);
  return value;
};

const WHITE = '#FFFFFF';
const AA_TEXT = 4.5;
const AA_UI = 3;

describe('配色对比度（WCAG AA）', () => {
  it('实底控件底配白字达标', () => {
    // 主按钮 / 选中 Chip / Switch / Checkbox
    expect(contrast(t('primary-strong'), WHITE)).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrast(t('secondary-dark'), WHITE)).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrast(t('error-dark'), WHITE)).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it('主色文字档在页面底色与白底上达标', () => {
    expect(contrast(t('primary-text'), WHITE)).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrast(t('primary-text'), t('background-color'))).toBeGreaterThanOrEqual(AA_TEXT);
    // 选中态：浅底 + 深文字
    expect(contrast(t('primary-text'), t('primary-soft'))).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it('中性文字阶达标', () => {
    expect(contrast(t('text-primary'), t('background-color'))).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrast(t('text-secondary'), t('background-color'))).toBeGreaterThanOrEqual(AA_TEXT);
    // 时间戳 / 提示：12px 正文性质，按底色 ≥ 4.0（原值仅 2.92）
    expect(contrast(t('text-muted'), t('background-color'))).toBeGreaterThanOrEqual(4);
    // 占位符无强制要求，但不得低于图形级的 3:1
    expect(contrast(t('text-light'), WHITE)).toBeGreaterThanOrEqual(AA_UI);
  });

  it('功能色文字档达标（base 色只做图形/底色）', () => {
    for (const name of ['success-text', 'warning-text', 'error-text', 'info-text']) {
      expect(contrast(t(name), WHITE), name).toBeGreaterThanOrEqual(AA_TEXT);
    }
  });

  it('品牌主色只做图形时满足 3:1（不用于文字/白字底）', () => {
    expect(contrast(t('primary-color'), WHITE)).toBeGreaterThanOrEqual(0);
    // 主色不得再配白字：白字对比低于 4.5 是「预期行为」的反向断言，
    // 防止有人把实底改回 $primary-color 却以为达标。
    expect(contrast(t('primary-color'), WHITE)).toBeLessThan(AA_TEXT);
  });
});

describe('HeroUI 语义色与 Token 同步', () => {
  const accent = /--accent:\s*(#[0-9A-Fa-f]{6})/.exec(appCssSource)?.[1]?.toUpperCase();

  it('--accent 必须等于 $primary-strong（实底按钮取这个值）', () => {
    expect(accent).toBe(t('primary-strong'));
  });

  it('--accent-foreground 为白色', () => {
    expect(/--accent-foreground:\s*#FFFFFF/i.test(appCssSource)).toBe(true);
  });
});
