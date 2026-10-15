import { describe, it, expect } from 'vitest';
import { formatDateString, formatDateTimeString } from './format';

describe('format', () => {
  describe('formatDateString', () => {
    it('应将 Date 格式化为 YYYY-MM-DD', () => {
      expect(formatDateString(new Date(2026, 6, 23))).toBe('2026-07-23');
    });

    it('应正确补零月份和日期', () => {
      expect(formatDateString(new Date(2026, 0, 5))).toBe('2026-01-05');
    });
  });

  describe('formatDateTimeString', () => {
    it('应将 Date 格式化为 YYYY-MM-DD HH:mm:ss', () => {
      expect(formatDateTimeString(new Date(2026, 6, 23, 14, 5, 9))).toBe('2026-07-23 14:05:09');
    });
  });
});
