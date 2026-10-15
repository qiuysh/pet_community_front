import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { chartTheme } from '../../styles/chartTheme';
import { adminUi } from '../../styles/adminUi';

interface MultiLineChartDataPoint {
  label: string;
  values: { [key: string]: number };
}

interface MultiLineChartProps {
  data: MultiLineChartDataPoint[];
  title: string;
  series: { name: string; color: string }[];
  height?: number;
}

export function MultiLineChart({
  data,
  title,
  series,
  height = 280,
}: MultiLineChartProps) {
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
    ...d.values,
  }));

  return (
    <div className={adminUi.chartCard}>
      <h3 className={`${adminUi.blockTitle} mb-4`}>{title}</h3>
      <div className="w-full min-w-0" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
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
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {series.map((s) => (
              <Line
                key={s.name}
                type="monotone"
                dataKey={s.name}
                name={s.name}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ fill: s.color, r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
