import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import type { TrendData } from '@/types/chart';
import { chartTheme } from '../../styles/chartTheme';
import { adminUi } from '../../styles/adminUi';

interface TodayTrendChartProps {
  userTrend: TrendData;
  postTrend?: TrendData | null;
  height?: number;
}

function labelOf(raw: string) {
  return raw.length > 5 ? raw.substring(5) : raw;
}

// 驾驶舱近 7 日趋势：用户增长 + 内容发布
export function TodayTrendChart({ userTrend, postTrend, height = 240 }: TodayTrendChartProps) {
  const chartData = userTrend.data.map((item, index) => {
    const postValue = postTrend?.data[index];
    return {
      name: labelOf(item.label),
      users: typeof item.value === 'number' ? item.value : 0,
      posts: typeof postValue?.value === 'number' ? postValue.value : 0,
    };
  });

  return (
    <div className={`${adminUi.chartCard} h-full`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className={adminUi.blockTitle}>近 7 日趋势</h3>
        <span className="shrink-0 text-xs text-brown-muted">用户增长 · 内容发布</span>
      </div>
      <div className="w-full min-w-0" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke={chartTheme.grid} vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: chartTheme.tick, fontSize: 11 }}
              axisLine={{ stroke: chartTheme.axis }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: chartTheme.tick, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={30}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: `1px solid ${chartTheme.tooltipBorder}`,
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="users"
              name="新增用户"
              stroke={chartTheme.secondary}
              strokeWidth={2}
              dot={false}
              activeDot={{ fill: chartTheme.secondary, r: 4 }}
            />
            {postTrend ? (
              <Line
                type="monotone"
                dataKey="posts"
                name="新增帖子"
                stroke={chartTheme.primary}
                strokeWidth={2}
                dot={false}
                activeDot={{ fill: chartTheme.primary, r: 4 }}
              />
            ) : null}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
