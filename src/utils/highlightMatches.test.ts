import { describe, it, expect } from 'vitest';
import { buildSnippet, splitHighlight } from './highlightMatches';

describe('highlightMatches', () => {
  describe('splitHighlight', () => {
    it('空关键词应整段不命中', () => {
      expect(splitHighlight('今天猫咪很乖', '  ')).toEqual([{ text: '今天猫咪很乖', match: false }]);
    });

    it('应切出命中片段（大小写不敏感）', () => {
      expect(splitHighlight('Hello Cat, cat!', 'CAT')).toEqual([
        { text: 'Hello ', match: false },
        { text: 'Cat', match: true },
        { text: ', ', match: false },
        { text: 'cat', match: true },
        { text: '!', match: false },
      ]);
    });

    it('未命中时返回单段', () => {
      expect(splitHighlight('abc', 'zzz')).toEqual([{ text: 'abc', match: false }]);
    });
  });

  describe('buildSnippet', () => {
    it('命中位于中间时应截取上下文并加省略号', () => {
      const text = 'a'.repeat(50) + '猫咪' + 'b'.repeat(50);
      const snippet = buildSnippet(text, '猫咪', 5);
      expect(snippet.startsWith('…')).toBe(true);
      expect(snippet.endsWith('…')).toBe(true);
      expect(snippet).toContain('猫咪');
    });

    it('未命中且文本较短时原样返回', () => {
      expect(buildSnippet('短文本', 'zzz')).toBe('短文本');
    });
  });
});
