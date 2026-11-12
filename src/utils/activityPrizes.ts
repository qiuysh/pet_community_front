/** 把活动奖品字段（可能是 JSON 字符串）格式化为可读行 */

export function formatActivityPrizes(raw: string | null | undefined): string[] {
  const text = (raw || '').trim();
  if (!text) return [];

  try {
    const parsed: unknown = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => {
          if (typeof item === 'string') return item.trim();
          if (item && typeof item === 'object') {
            const row = item as Record<string, unknown>;
            const name = String(row.name ?? row.title ?? row.prize ?? '').trim();
            const rank = String(row.rank ?? row.level ?? row.place ?? '').trim();
            const desc = String(row.description ?? row.desc ?? '').trim();
            if (name && rank) return `${rank}：${name}${desc ? `（${desc}）` : ''}`;
            if (name) return desc ? `${name}（${desc}）` : name;
            return JSON.stringify(item);
          }
          return String(item);
        })
        .filter(Boolean);
    }
    if (parsed && typeof parsed === 'object') {
      return Object.entries(parsed as Record<string, unknown>).map(([k, v]) => {
        if (v && typeof v === 'object') {
          return `${k}：${JSON.stringify(v)}`;
        }
        return `${k}：${String(v)}`;
      });
    }
  } catch {
    /* 非 JSON，按原文多行展示 */
  }

  return text
    .split(/\r?\n|;|；/)
    .map((line) => line.trim())
    .filter(Boolean);
}
