import { describe, it, expect } from 'vitest';
import { dayOverDayChange, formatCount } from './dashboardMetrics';

describe('dayOverDayChange', () => {
  it('昨日为 0 且今日有值 → +100%', () => {
    expect(dayOverDayChange(5, 0)).toEqual({ change: '+100%', changeType: 'up' });
  });

  it('计算上升环比', () => {
    expect(dayOverDayChange(12, 10)).toEqual({ change: '+20%', changeType: 'up' });
  });

  it('计算下降环比', () => {
    expect(dayOverDayChange(8, 10)).toEqual({ change: '-20%', changeType: 'down' });
  });

  it('持平', () => {
    expect(dayOverDayChange(10, 10)).toEqual({ change: '0%', changeType: 'flat' });
  });

  it('今日为 0 且昨日有值 → 显示 —', () => {
    expect(dayOverDayChange(0, 5)).toEqual({ change: '—', changeType: 'flat' });
  });

  it('今日昨日均为 0 → 0%', () => {
    expect(dayOverDayChange(0, 0)).toEqual({ change: '0%', changeType: 'flat' });
  });
});

describe('formatCount', () => {
  it('格式化数字', () => {
    expect(formatCount(1234)).toMatch(/1/);
    expect(formatCount(null)).toBe('0');
  });
});
