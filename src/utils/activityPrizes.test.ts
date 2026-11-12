import { describe, expect, it } from 'vitest';
import { formatActivityPrizes } from './activityPrizes';

describe('formatActivityPrizes', () => {
  it('解析奖品数组 JSON', () => {
    const raw = JSON.stringify([
      { rank: '一等奖', name: '猫爬架' },
      { rank: '二等奖', name: '罐头礼盒' },
    ]);
    expect(formatActivityPrizes(raw)).toEqual(['一等奖：猫爬架', '二等奖：罐头礼盒']);
  });

  it('非 JSON 按行拆分', () => {
    expect(formatActivityPrizes('一等奖：玩具\n二等奖：零食')).toEqual([
      '一等奖：玩具',
      '二等奖：零食',
    ]);
  });

  it('空值返回空数组', () => {
    expect(formatActivityPrizes('')).toEqual([]);
  });
});
