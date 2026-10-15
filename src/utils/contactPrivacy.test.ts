import { describe, it, expect } from 'vitest';
import { maskContact, looksLikeFullPhone } from './contactPrivacy';

describe('maskContact', () => {
  it('登录用户返回原值', () => {
    expect(maskContact('13812345678', true)).toBe('13812345678');
    expect(maskContact('wechat_abc', true)).toBe('wechat_abc');
  });

  it('空值原样返回', () => {
    expect(maskContact('', false)).toBe('');
  });

  it('游客视角手机号脱敏为前3+****+后4', () => {
    expect(maskContact('13812345678', false)).toBe('138****5678');
  });

  it('游客视角短串脱敏', () => {
    expect(maskContact('abc', false)).toBe('a**');
    expect(maskContact('12345', false)).toBe('12****5');
  });

  it('游客视角微信号脱敏', () => {
    expect(maskContact('wechat_x', false)).toMatch(/\*+/);
  });

  it('脱敏后不含 11 位连续数字', () => {
    const masked = maskContact('13812345678', false);
    expect(looksLikeFullPhone(masked)).toBe(false);
  });
});

describe('looksLikeFullPhone', () => {
  it('完整手机号返回 true', () => {
    expect(looksLikeFullPhone('13812345678')).toBe(true);
  });
  it('脱敏后返回 false', () => {
    expect(looksLikeFullPhone('138****5678')).toBe(false);
  });
});
