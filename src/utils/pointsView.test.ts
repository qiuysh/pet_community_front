import { describe, expect, it } from 'vitest';
import {
  levelMaxPoints,
  levelMinPoints,
  levelProgressPercent,
  toLevelBenefitView,
  toUserLevelView,
} from './pointsView';

describe('pointsView', () => {
  it('maps BE UserLevel points/level into progress bands (200 pts/level)', () => {
    const view = toUserLevelView({ level: 2, points: 250, totalPoints: 250 });
    expect(view).toEqual({
      level: 2,
      levelName: 'Lv.2',
      currentPoints: 250,
      minPoints: 200,
      maxPoints: 400,
    });
    expect(levelProgressPercent(view!)).toBe(25);
  });

  it('maps BE LevelBenefit benefitType/description to display fields', () => {
    const view = toLevelBenefitView({
      id: 1,
      level: 5,
      benefitType: 'topic_create',
      benefitValue: '1',
      description: '可申请创建话题',
    });
    expect(view.benefitName).toBe('创建话题');
    expect(view.benefitDesc).toBe('可申请创建话题');
  });

  it('Lv10 band tops at 2000 and missing FE-only fields no longer yield NaN progress', () => {
    expect(levelMinPoints(10)).toBe(1800);
    expect(levelMaxPoints(10)).toBe(2000);
    const view = toUserLevelView({ level: 1, points: 0 });
    expect(levelProgressPercent(view!)).toBe(0);
  });
});
