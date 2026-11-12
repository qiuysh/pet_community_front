import { describe, expect, it } from 'vitest';
import { summarizeSecurityNotification } from './notificationDisplay';

describe('summarizeSecurityNotification', () => {
  it('折叠 Chrome UA 为可读摘要', () => {
    const raw =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36 · 北京市 · 1.2.3.4';
    const { summary, detail } = summarizeSecurityNotification(raw);
    expect(summary).toContain('Chrome');
    expect(summary).toContain('北京');
    expect(detail).toBe(raw);
  });

  it('空内容回落默认文案', () => {
    expect(summarizeSecurityNotification('').summary).toBe('新设备登录');
  });
});
