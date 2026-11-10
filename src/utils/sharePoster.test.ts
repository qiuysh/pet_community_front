import { describe, it, expect, vi } from 'vitest';
import { wrapTextLines, posterCopyText } from './sharePoster';

describe('sharePoster', () => {
  it('wrapTextLines 应限制最大行数并加省略号', () => {
    const ctx = {
      measureText: (text: string) => ({ width: text.length * 10 }),
    } as unknown as CanvasRenderingContext2D;
    const lines = wrapTextLines(ctx, '这是一段很长很长很长很长很长很长很长很长的标题用来测试换行', 80, 2);
    expect(lines.length).toBe(2);
    expect(lines[1].endsWith('…')).toBe(true);
    vi.unstubAllGlobals?.();
  });

  it('posterCopyText 应包含标题、站点与链接', () => {
    const text = posterCopyText({
      url: 'https://example.com/p/1',
      title: '今日晒宠',
      siteName: '喵星社区',
    });
    expect(text).toContain('今日晒宠');
    expect(text).toContain('喵星社区');
    expect(text).toContain('https://example.com/p/1');
  });
});
