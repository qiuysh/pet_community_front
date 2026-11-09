/** 正在输入的 @ 触发：返回 query 起始下标与当前关键字（不含 @） */
export function getMentionTrigger(
  text: string,
  cursor: number,
): { start: number; query: string } | null {
  if (cursor < 0 || cursor > text.length) return null;
  const before = text.slice(0, cursor);
  const at = before.lastIndexOf('@');
  if (at < 0) return null;
  if (at > 0) {
    const prev = before[at - 1];
    // @ 须在开头或空白后，避免邮箱等误触发
    if (prev && !/\s/.test(prev)) return null;
  }
  const query = before.slice(at + 1);
  if (/\s/.test(query)) return null;
  return { start: at, query };
}

/** 用选中昵称替换当前 @query，并在末尾补空格 */
export function applyMention(
  text: string,
  start: number,
  query: string,
  nickname: string,
): { text: string; cursor: number } {
  const before = text.slice(0, start);
  const after = text.slice(start + 1 + query.length);
  const inserted = `@${nickname} `;
  const next = `${before}${inserted}${after}`;
  return { text: next, cursor: before.length + inserted.length };
}

/** 从正文提取 @昵称（与后端 ParseAtUsers 的 `\S+` 口径一致） */
export function extractMentionNicknames(text: string): string[] {
  const matches = text.match(/@(\S+)/g);
  if (!matches) return [];
  const seen = new Set<string>();
  const nicknames: string[] = [];
  for (const raw of matches) {
    const name = raw.slice(1);
    if (!name || seen.has(name)) continue;
    seen.add(name);
    nicknames.push(name);
  }
  return nicknames;
}
