import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DistributionData } from '@/types/chart';
import { chartTheme } from '../../styles/chartTheme';
import { adminUi } from '../../styles/adminUi';

interface DistributionChartProps {
  data: DistributionData;
  height?: number;
}

const COLORS = ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-warning)', 'var(--color-primary-light)', 'var(--color-info)', 'var(--color-secondary-light)', 'var(--color-warning)', 'var(--color-primary-light)'];

// 分布图表组件（分析报表专用）- 饼图/柱状图
export function DistributionChart({ data, height = 300 }: DistributionChartProps) {
  const chartData = data.data.map(item => ({
    name: item.label,
    value: typeof item.value === 'number' ? item.value : 0,
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number; percent?: number }[] }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
      return (
        <div className="rounded-md border border-border bg-white p-3 shadow-lg">
          <p className="font-medium text-brown">{item.name}</p>
          <p className="text-sm tabular-nums text-brown-secondary">数量：{item.value}</p>
          <p className="text-sm tabular-nums text-brown-muted">占比：{percent}%</p>
        </div>
      );
    }
    return null;
  };

  if (data.type === 'pie') {
    return (
      <div className={adminUi.chartCard}>
        <h3 className={`${adminUi.blockTitle} mb-4`}>{data.title}</h3>
        <div className="flex w-full min-w-0 items-center justify-center" style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return (
    <div className={adminUi.chartCard}>
      <h3 className={`${adminUi.blockTitle} mb-4`}>{data.title}</h3>
      <div className="w-full min-w-0" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
            <XAxis
              type="number"
              tick={{ fill: chartTheme.tick, fontSize: 12 }}
              axisLine={{ stroke: chartTheme.axis }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: chartTheme.tick, fontSize: 12 }}
              axisLine={{ stroke: chartTheme.axis }}
              width={80}
            />
            <Tooltip
              formatter={(value: number) => [`${value}`, '数量']}
              contentStyle={{
                backgroundColor: 'white',
                border: `1px solid ${chartTheme.tooltipBorder}`,
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
            <Bar
              dataKey="value"
              fill="var(--color-primary)"
              radius={[0, 4, 4, 0]}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
