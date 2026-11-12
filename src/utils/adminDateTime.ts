import { formatDateTimeString } from './format';

/** 后台统一时间展示：zh-CN 风格的 24h `YYYY-MM-DD HH:mm:ss` */
export function formatAdminDateTime(value: string | number | Date | null | undefined): string {
  if (value == null || value === '') return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return formatDateTimeString(date);
}
