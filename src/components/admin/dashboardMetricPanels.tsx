import type { ReactNode } from 'react';

type ChangeType = 'up' | 'down' | 'flat';

/** 与 DashboardCard / 趋势卡同一套白底卡片壳 */
const panelShell =
  'min-w-0 w-full rounded-md border border-border-light/60 !bg-white p-5 shadow-card';

export interface CompactMetric {
  key: string;
  label: string;
  value: string;
  change?: string;
  changeType?: ChangeType;
  hint?: string;
  icon?: ReactNode;
}

function changeClass(type?: ChangeType) {
  if (type === 'up') return 'text-success';
  if (type === 'down') return 'text-error';
  return 'text-brown-muted';
}

interface MetricGroup {
  title: string;
  items: CompactMetric[];
}

/** 今日互动与活动：单卡内左右分组，紧凑数字条 */
export function DashboardInteractionPanel({
  interaction,
  activity,
}: {
  interaction: CompactMetric[];
  activity: CompactMetric[];
}) {
  const groups: MetricGroup[] = [
    { title: '内容互动', items: interaction },
    { title: '活动参与', items: activity },
  ];

  return (
    <div className={panelShell}>
      <div className="grid grid-cols-1 divide-y divide-border-light md:grid-cols-2 md:divide-x md:divide-y-0">
        {groups.map((group) => (
          <div key={group.title} className="min-w-0 p-1 md:px-5 md:first:pl-0 md:last:pr-0">
            <p className="mb-3 text-xs font-medium tracking-wide text-brown-muted">{group.title}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              {group.items.map((item) => (
                <div key={item.key} className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs text-brown-muted">
                    {item.icon ? <span className="text-secondary/80" aria-hidden="true">{item.icon}</span> : null}
                    <span className="truncate">{item.label}</span>
                  </div>
                  <p className="mt-1 text-lg font-semibold tabular-nums text-brown">{item.value}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                    {item.change ? (
                      <span className={`tabular-nums ${changeClass(item.changeType)}`}>
                        {item.change}
                        <span className="ml-1 text-brown-muted">较昨日</span>
                      </span>
                    ) : null}
                    {item.hint ? <span className="truncate text-brown-muted">{item.hint}</span> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export interface StockMetric {
  key: string;
  label: string;
  value: string;
  hint?: string;
}

interface StockGroup {
  title: string;
  items: StockMetric[];
}

/** 业务存量：与互动卡同一白底壳，三列分隔 */
export function DashboardStockPanel({ groups }: { groups: StockGroup[] }) {
  return (
    <div className={panelShell}>
      <div className="grid grid-cols-1 divide-y divide-border-light sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {groups.map((group) => (
          <div key={group.title} className="min-w-0 py-4 first:pt-0 last:pb-0 sm:px-5 sm:py-0 sm:first:pl-0 sm:last:pr-0">
            <p className="mb-3 text-xs font-medium tracking-wide text-brown-muted">{group.title}</p>
            <dl className="space-y-3">
              {group.items.map((item) => (
                <div key={item.key} className="flex items-baseline justify-between gap-3">
                  <dt className="min-w-0 truncate text-sm text-brown-secondary">{item.label}</dt>
                  <dd className="shrink-0 text-right">
                    <span className="text-base font-semibold tabular-nums text-brown">{item.value}</span>
                    {item.hint ? (
                      <span className="mt-0.5 block text-xs text-brown-muted">{item.hint}</span>
                    ) : null}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
