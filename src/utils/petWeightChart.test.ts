import { describe, it, expect } from 'vitest';
import type { PetGrowthRecordInfo } from '../types/pet';
import { buildWeightChartPoints, shouldShowWeightChart } from './petWeightChart';

function record(partial: Partial<PetGrowthRecordInfo> & Pick<PetGrowthRecordInfo, 'id' | 'recordDate' | 'weight'>): PetGrowthRecordInfo {
  return {
    petId: 1,
    title: '体重记录',
    height: 0,
    content: '',
    images: [],
    createdAt: partial.recordDate,
    ...partial,
  };
}

describe('petWeightChart', () => {
  const now = new Date('2026-11-10T12:00:00');

  it('excludes zero/empty weight and sorts by date', () => {
    const points = buildWeightChartPoints(
      [
        record({ id: 2, recordDate: '2026-10-01', weight: 5 }),
        record({ id: 1, recordDate: '2026-09-01', weight: 0 }),
        record({ id: 3, recordDate: '2026-08-01', weight: 4.2 }),
      ],
      'all',
      now,
    );
    expect(points.map((p) => p.weight)).toEqual([4.2, 5]);
    expect(points[0].date).toBe('2026-08-01');
  });

  it('filters by 3 months', () => {
    const points = buildWeightChartPoints(
      [
        record({ id: 1, recordDate: '2026-07-01', weight: 3 }),
        record({ id: 2, recordDate: '2026-09-01', weight: 4 }),
        record({ id: 3, recordDate: '2026-11-01', weight: 5 }),
      ],
      '3m',
      now,
    );
    expect(points.map((p) => p.weight)).toEqual([4, 5]);
  });

  it('shouldShowWeightChart requires at least 2 points', () => {
    expect(shouldShowWeightChart([{ date: '2026-01-01', label: '01-01', weight: 1 }])).toBe(false);
    expect(
      shouldShowWeightChart([
        { date: '2026-01-01', label: '01-01', weight: 1 },
        { date: '2026-02-01', label: '02-01', weight: 2 },
      ]),
    ).toBe(true);
  });
});
