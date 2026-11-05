import { describe, it, expect } from 'vitest';
import {
  formatCount,
  formatDate,
  formatDateTime,
  formatDateString,
  formatDateTimeString,
  formatNumber,
} from './format';

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

  describe('formatNumber', () => {
    it('应输出千分位', () => {
      expect(formatNumber(1234)).toBe('1,234');
      expect(formatNumber(0)).toBe('0');
    });

    it('非法输入应回退为 0', () => {
      expect(formatNumber(Number.NaN)).toBe('0');
      expect(formatNumber(Number.POSITIVE_INFINITY)).toBe('0');
    });
  });

  describe('formatCount', () => {
    it('万以下使用千分位而非 k 缩写', () => {
      expect(formatCount(9999)).toBe('9,999');
    });

    it('万级使用「万」并保留一位小数', () => {
      expect(formatCount(12345)).toBe('1.2万');
      expect(formatCount(10000)).toBe('1万');
    });

    it('亿级使用「亿」', () => {
      expect(formatCount(123_456_789)).toBe('1.2亿');
    });

    it('负数与非法输入应归零', () => {
      expect(formatCount(-5)).toBe('0');
      expect(formatCount(Number.NaN)).toBe('0');
    });
  });

  describe('formatDate / formatDateTime', () => {
    it('应输出短横线分隔的日期', () => {
      expect(formatDate(new Date(2026, 0, 5))).toBe('2026-01-05');
    });

    it('应接受 ISO 字符串', () => {
      expect(formatDateTime('2026-07-23T14:05:09')).toBe('2026-07-23 14:05');
    });

    it('非法输入返回空串', () => {
      expect(formatDate('not-a-date')).toBe('');
      expect(formatDateTime('')).toBe('');
    });
  });
});
