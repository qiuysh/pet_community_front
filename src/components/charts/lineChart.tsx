import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { chartTheme } from '../../styles/chartTheme';
import { adminUi } from '../../styles/adminUi';

interface LineChartDataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineChartDataPoint[];
  title: string;
  color?: string;
  height?: number;
}

export function LineChart({
  data,
  title,
  color = chartTheme.primary,
  height = 280,
}: LineChartProps) {
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
  const gradientId = `line-fill-${title.replace(/\s+/g, '-')}`;

  return (
    <div className={adminUi.chartCard}>
      <h3 className={`${adminUi.blockTitle} mb-4`}>{title}</h3>
      <div className="w-full min-w-0" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
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
              contentStyle={{
                backgroundColor: 'white',
                border: `1px solid ${chartTheme.tooltipBorder}`,
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              name={title}
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={{ fill: 'white', stroke: color, strokeWidth: 2, r: 3 }}
              activeDot={{ fill: color, r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
