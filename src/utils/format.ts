export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateTimeString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/** 聊天气泡时间：当天显示 HH:mm，昨天显示「昨天 HH:mm」，更早显示 MM-DD HH:mm */
export function formatChatTime(input: string): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const time = `${hh}:${mm}`;

  const isSameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (isSameDay) return time;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();
  if (isYesterday) return `昨天 ${time}`;

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day} ${time}`;
}

/** 语音时长：65 → 1:05 */
export function formatVoiceDuration(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds || 0));
  const min = Math.floor(safe / 60);
  const sec = safe % 60;
  return `${min}:${String(sec).padStart(2, '0')}`;
}

// Intl 实例创建开销较大，模块级复用；所有对外展示的数字/日期都应经由本文件格式化，
// 避免各页面自行 toLocaleString 造成格式漂移。
const integerFormatter = new Intl.NumberFormat('zh-CN');
const oneDecimalFormatter = new Intl.NumberFormat('zh-CN', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const timeFormatter = new Intl.DateTimeFormat('zh-CN', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

/** 千分位数字：1234 → 1,234 */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '0';
  return integerFormatter.format(Math.round(value));
}

/**
 * 计数缩写：9999 → 9,999；12345 → 1.2万；123456789 → 1.2亿
 * 中文站点统一用「万/亿」，不使用 k/M 以免与千分位混读。
 */
export function formatCount(value: number): string {
  if (!Number.isFinite(value)) return '0';
  const count = Math.max(0, Math.round(value));
  if (count >= 100_000_000) return `${trimZero(oneDecimalFormatter.format(count / 100_000_000))}亿`;
  if (count >= 10_000) return `${trimZero(oneDecimalFormatter.format(count / 10_000))}万`;
  return integerFormatter.format(count);
}

/** 展示用日期：2026-11-04；非法输入返回空串 */
export function formatDate(value: string | number | Date): string {
  const date = toValidDate(value);
  if (!date) return '';
  const parts = dateFormatter.formatToParts(date);
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';
  return `${pick('year')}-${pick('month')}-${pick('day')}`;
}

/** 展示用日期时间：2026-11-04 16:24；非法输入返回空串 */
export function formatDateTime(value: string | number | Date): string {
  const date = toValidDate(value);
  if (!date) return '';
  return `${formatDate(date)} ${timeFormatter.format(date)}`;
}

/**
 * 相对时间（I1-06 / N6-04）：刚刚 / N分钟前 / N小时前 / N天前；
 * 超过 7 天回退为 formatDate。非法输入返回空串。
 */
export function formatRelativeTime(value: string | number | Date, now: Date = new Date()): string {
  const date = toValidDate(value);
  if (!date) return '';

  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return formatDate(date);

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;

  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 24) return `${hours}小时前`;

  const days = Math.floor(diffMs / 86_400_000);
  if (days < 7) return `${days}天前`;

  return formatDate(date);
}

function trimZero(text: string): string {
  return text.endsWith('.0') ? text.slice(0, -2) : text;
}

function toValidDate(value: string | number | Date): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
