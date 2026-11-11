import type { PetGrowthRecordInfo } from '../types/pet';

export type WeightChartRange = '3m' | '1y' | 'all';

export interface WeightChartPoint {
  /** 完整日期 YYYY-MM-DD，用于排序与 tooltip */
  date: string;
  /** 横轴短标签 */
  label: string;
  weight: number;
}

function toValidDate(value: string): Date | null {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDay(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function shortLabel(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${m}-${day}`;
}

function rangeStartDay(range: WeightChartRange, now: Date): string | null {
  if (range === 'all') return null;
  const start = new Date(now);
  if (range === '3m') {
    start.setMonth(start.getMonth() - 3);
  } else {
    start.setFullYear(start.getFullYear() - 1);
  }
  return formatDay(start);
}

/**
 * 从成长记录提取体重曲线点（R1）：
 * - 排除 weight ≤ 0 / 非法日期
 * - 按 recordDate 升序
 * - 按区间截取（3m / 1y / all）
 */
export function buildWeightChartPoints(
  records: PetGrowthRecordInfo[],
  range: WeightChartRange = 'all',
  now: Date = new Date(),
): WeightChartPoint[] {
  const startDay = rangeStartDay(range, now);
  const points: WeightChartPoint[] = [];

  for (const record of records) {
    const weight = Number(record.weight);
    if (!Number.isFinite(weight) || weight <= 0) continue;
    const date = toValidDate(record.recordDate);
    if (!date) continue;
    const day = formatDay(date);
    if (startDay && day < startDay) continue;
    points.push({
      date: day,
      label: shortLabel(date),
      weight,
    });
  }

  points.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return points;
}

/** 规格：至少 2 个有效体重点才展示曲线 */
export function shouldShowWeightChart(points: WeightChartPoint[]): boolean {
  return points.length >= 2;
}
