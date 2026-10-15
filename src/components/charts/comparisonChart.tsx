import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { ComparisonData } from '@/types/chart';
import { chartTheme } from '../../styles/chartTheme';
import { adminUi } from '../../styles/adminUi';

interface ComparisonChartProps {
  data: ComparisonData;
  height?: number;
}

// 对比图表组件（分析报表专用）- 本期 vs 上期
export function ComparisonChart({ data, height = 300 }: ComparisonChartProps) {
  const currentSum = data.current.reduce((sum, item) => sum + (typeof item.value === 'number' ? item.value : 0), 0);
  const previousSum = data.previous.reduce((sum, item) => sum + (typeof item.value === 'number' ? item.value : 0), 0);

  const changeRate = previousSum > 0 ? (((currentSum - previousSum) / previousSum) * 100).toFixed(1) : '0';
  const previousLabel = data.comparison === '环比' ? '上周' : '上月';

  const chartData = data.current.map((item, index) => ({
    name: item.label,
    current: typeof item.value === 'number' ? item.value : 0,
    previous: index < data.previous.length ? (typeof data.previous[index].value === 'number' ? data.previous[index].value : 0) : 0,
  }));

  return (
    <div className={adminUi.chartCard}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className={adminUi.blockTitle}>{data.title}</h3>
        <span className={`text-sm font-medium tabular-nums ${parseFloat(changeRate) >= 0 ? 'text-success' : 'text-error'}`}>
          {parseFloat(changeRate) >= 0 ? '+' : ''}{changeRate}%
        </span>
      </div>
      <div className="w-full min-w-0" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
            <XAxis
              dataKey="name"
              tick={{ fill: chartTheme.tick, fontSize: 12 }}
              axisLine={{ stroke: chartTheme.axis }}
            />
            <YAxis
              tick={{ fill: chartTheme.tick, fontSize: 12 }}
              axisLine={{ stroke: chartTheme.axis }}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: `1px solid ${chartTheme.tooltipBorder}`,
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="current"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={{ fill: 'var(--color-primary)', strokeWidth: 2 }}
              activeDot={{ fill: 'var(--color-primary)', r: 6 }}
              name="本期"
            />
            <Line
              type="monotone"
              dataKey="previous"
              stroke={chartTheme.mutedSeries}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: chartTheme.mutedSeries, strokeWidth: 2 }}
              activeDot={{ fill: chartTheme.mutedSeries, r: 6 }}
              name={previousLabel}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
