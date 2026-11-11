export interface HighlightSegment {
  text: string;
  match: boolean;
}

/**
 * 按关键词切分文本（大小写不敏感），用于搜索结果高亮
 */
export function splitHighlight(text: string, keyword: string): HighlightSegment[] {
  const kw = keyword.trim();
  if (!kw) return [{ text, match: false }];

  const lowerText = text.toLowerCase();
  const lowerKw = kw.toLowerCase();
  const segments: HighlightSegment[] = [];
  let cursor = 0;
  let index = lowerText.indexOf(lowerKw);

  while (index !== -1) {
    if (index > cursor) {
      segments.push({ text: text.slice(cursor, index), match: false });
    }
    segments.push({ text: text.slice(index, index + kw.length), match: true });
    cursor = index + kw.length;
    index = lowerText.indexOf(lowerKw, cursor);
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), match: false });
  }
  return segments;
}

/**
 * 截取命中关键词附近的片段，便于在结果列表中展示上下文
 */
export function buildSnippet(text: string, keyword: string, radius = 24): string {
  const kw = keyword.trim();
  if (!kw) return text;

  const index = text.toLowerCase().indexOf(kw.toLowerCase());
  if (index === -1) {
    return text.length > radius * 2 ? `${text.slice(0, radius * 2)}…` : text;
  }

  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + kw.length + radius);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < text.length ? '…' : '';
  return `${prefix}${text.slice(start, end)}${suffix}`;
}
