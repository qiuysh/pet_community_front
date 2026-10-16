import { describe, it, expect } from 'vitest';
import { ICON_SIZE, iconStroke } from './iconSize';

describe('ICON_SIZE', () => {
  it('场景尺寸符合设计规范', () => {
    expect(ICON_SIZE.inline).toBe(16);
    expect(ICON_SIZE.action).toBe(20);
    expect(ICON_SIZE.nav).toBe(24);
    expect(ICON_SIZE.feature).toBe(32);
    expect(ICON_SIZE.empty).toBe(48);
  });

  it('小尺寸线宽更粗以保证可读', () => {
    expect(iconStroke(16)).toBeGreaterThan(iconStroke(24));
    expect(iconStroke(20)).toBe(2);
  });
});
