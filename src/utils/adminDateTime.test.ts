import { describe, expect, it } from 'vitest';
import { formatAdminDateTime } from './adminDateTime';

describe('formatAdminDateTime', () => {
  it('格式化为 24h 本地时间串', () => {
    const text = formatAdminDateTime('2024-06-01T15:04:05');
    expect(text).toMatch(/2024-06-01 \d{2}:\d{2}:\d{2}/);
  });

  it('非法值回落破折号', () => {
    expect(formatAdminDateTime('not-a-date')).toBe('—');
    expect(formatAdminDateTime(null)).toBe('—');
  });
});
