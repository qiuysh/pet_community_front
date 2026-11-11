import { describe, expect, it } from 'vitest';
import { buildLostPetShareTitle, LOST_PET_STATUS } from './lostPetShare';

describe('buildLostPetShareTitle', () => {
  it('寻找中使用【寻宠】前缀并截取描述前 60 字', () => {
    const long = 'a'.repeat(80);
    expect(
      buildLostPetShareTitle({
        petName: '豆豆',
        lostLocation: '朝阳公园',
        description: long,
        status: LOST_PET_STATUS.searching,
      }),
    ).toBe(`【寻宠】豆豆 · 朝阳公园\n${'a'.repeat(60)}`);
  });

  it('已找回使用【已找回】前缀', () => {
    expect(
      buildLostPetShareTitle({
        petName: '咪咪',
        lostLocation: '望京',
        description: '橘猫',
        status: LOST_PET_STATUS.found,
      }),
    ).toBe('【已找回】咪咪 · 望京\n橘猫');
  });

  it('无描述时只有标题行', () => {
    expect(
      buildLostPetShareTitle({
        petName: '旺财',
        lostLocation: '五道口',
        status: LOST_PET_STATUS.searching,
      }),
    ).toBe('【寻宠】旺财 · 五道口');
  });
});
