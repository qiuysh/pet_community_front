/** 将后台 DateTimePicker 值转为后端 RFC3339 */
export function toRFC3339(value: string): string {
  if (!value?.trim()) return value;
  const raw = value.trim();
  const normalized = raw.length === 16 ? `${raw}:00` : raw;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toISOString();
}

/** 将后端 RFC3339 / ISO 转为 DateTimePicker 可用的 YYYY-MM-DDTHH:mm */
export function toDateTimeLocal(value?: string | null): string {
  if (!value?.trim()) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 16);
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
