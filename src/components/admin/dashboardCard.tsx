interface DashboardCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'up' | 'down' | 'flat';
  /** 环比说明，默认「较昨日」 */
  changeLabel?: string;
  /** 次要说明，如累计值 */
  hint?: string;
  icon: React.ReactNode;
  /** 图标容器色，建议用 soft 底 + 语义字色，如 bg-secondary-soft text-secondary */
  iconTone?: string;
}

export function DashboardCard({
  label,
  value,
  change,
  changeType,
  changeLabel = '较昨日',
  hint,
  icon,
  iconTone = 'bg-secondary-soft text-secondary',
}: DashboardCardProps) {
  const changeTone =
    changeType === 'up' ? 'text-success' : changeType === 'down' ? 'text-error' : 'text-brown-muted';

  return (
    <div className="min-w-0 rounded-md border border-border-light/60 !bg-white p-5 shadow-card transition-shadow hover:shadow-hover">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm text-brown-muted">{label}</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-brown">{value}</p>
          {hint ? <p className="mt-1 truncate text-xs text-brown-muted">{hint}</p> : null}
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-sm ${iconTone}`} aria-hidden="true">{icon}</div>
      </div>
      {change && (
        <div className="mt-4 flex items-center">
          <span className={`text-sm font-medium tabular-nums ${changeTone}`}>
            {change}
          </span>
          <span className="ml-2 text-xs text-brown-muted">{changeLabel}</span>
        </div>
      )}
    </div>
  );
}
