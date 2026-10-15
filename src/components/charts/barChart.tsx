import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { chartTheme } from '../../styles/chartTheme';
import { adminUi } from '../../styles/adminUi';

interface BarChartDataPoint {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarChartDataPoint[];
  title: string;
  color?: string;
  height?: number;
}

export function BarChart({
  data,
  title,
  color = chartTheme.primary,
  height = 280,
}: BarChartProps) {
  if (data.length === 0) {
    return (
      <div className={adminUi.chartCard}>
        <h3 className={`${adminUi.blockTitle} mb-4`}>{title}</h3>
        <div className="flex h-48 items-center justify-center text-sm text-brown-muted">
          暂无数据
        </div>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.label.length > 5 ? d.label.slice(5) : d.label,
    value: d.value,
  }));

  return (
    <div className={adminUi.chartCard}>
      <h3 className={`${adminUi.blockTitle} mb-4`}>{title}</h3>
      <div className="w-full min-w-0" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ReBarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke={chartTheme.grid} vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: chartTheme.tick, fontSize: 12 }}
              axisLine={{ stroke: chartTheme.axis }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: chartTheme.tick, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              formatter={(value: number) => [`${value}`, '数量']}
              contentStyle={{
                backgroundColor: 'white',
                border: `1px solid ${chartTheme.tooltipBorder}`,
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="value" name={title} radius={[4, 4, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={color} />
              ))}
            </Bar>
          </ReBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
