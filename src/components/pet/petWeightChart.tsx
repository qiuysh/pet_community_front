import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PetGrowthRecordInfo } from '../../types/pet';
import { chartTheme } from '../../styles/chartTheme';
import {
  buildWeightChartPoints,
  shouldShowWeightChart,
  type WeightChartRange,
} from '../../utils/petWeightChart';
import { FilterChip } from '../ui/filterChip';

const RANGES: { key: WeightChartRange; label: string }[] = [
  { key: '3m', label: '近 3 个月' },
  { key: '1y', label: '近 1 年' },
  { key: 'all', label: '全部' },
];

export interface PetWeightChartProps {
  records: PetGrowthRecordInfo[];
  className?: string;
}

/**
 * 成长记录体重曲线（R1）：≥2 个有效体重点才展示；区间 3m / 1y / 全部。
 */
export function PetWeightChart({ records, className = '' }: PetWeightChartProps) {
  const [range, setRange] = useState<WeightChartRange>('all');

  const points = useMemo(() => buildWeightChartPoints(records, range), [records, range]);
  const allValid = useMemo(() => buildWeightChartPoints(records, 'all'), [records]);

  // 全集不足 2 点则整块隐藏；当前区间不足时提示切换
  if (!shouldShowWeightChart(allValid)) return null;

  return (
    <div
      className={[
        'mb-5 rounded-lg border border-border-light bg-soft/50 p-3 sm:p-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-medium text-brown">体重曲线</h4>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="体重曲线时间范围">
          {RANGES.map((item) => (
            <FilterChip
              key={item.key}
              active={range === item.key}
              onClick={() => setRange(item.key)}
            >
              {item.label}
            </FilterChip>
          ))}
        </div>
      </div>

      {!shouldShowWeightChart(points) ? (
        <p className="py-8 text-center text-sm text-brown-muted">
          当前区间有效体重记录不足 2 条，可切换「全部」查看
        </p>
      ) : (
        <div className="h-52 w-full min-w-0 sm:h-60" role="img" aria-label="宠物体重变化折线图">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="pet-weight-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartTheme.primary} stopOpacity={0.28} />
                  <stop offset="95%" stopColor={chartTheme.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke={chartTheme.grid} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: chartTheme.tick, fontSize: 12 }}
                axisLine={{ stroke: chartTheme.axis }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: chartTheme.tick, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={36}
                unit="kg"
              />
              <Tooltip
                formatter={(value: number) => [`${value} kg`, '体重']}
                labelFormatter={(_, payload) => {
                  const row = payload?.[0]?.payload as { date?: string } | undefined;
                  return row?.date ? `日期 ${row.date}` : '';
                }}
                contentStyle={{
                  backgroundColor: 'white',
                  border: `1px solid ${chartTheme.tooltipBorder}`,
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(43,47,51,0.08)',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="weight"
                name="体重"
                stroke={chartTheme.primary}
                strokeWidth={2}
                fill="url(#pet-weight-fill)"
                dot={{ fill: 'white', stroke: chartTheme.primary, strokeWidth: 2, r: 3 }}
                activeDot={{ fill: chartTheme.primary, r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
