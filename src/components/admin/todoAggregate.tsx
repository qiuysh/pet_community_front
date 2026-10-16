import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { TodoAggregate as TodoAggregateData } from '@/types/chart';
import { adminUi } from '@/styles/adminUi';

interface TodoAggregateProps {
  data: TodoAggregateData | null;
  loading?: boolean;
}

/** 待办聚合（驾驶舱）：Link 导航，支持 Cmd/Ctrl+click */
export function TodoAggregate({ data, loading }: TodoAggregateProps) {
  if (loading) {
    return (
      <div className={adminUi.chartCard}>
        <div className="animate-pulse">
          <div className="mb-3 h-4 w-1/4 rounded bg-muted" />
          <div className="space-y-2">
            <div className="h-8 rounded bg-muted" />
            <div className="h-8 rounded bg-muted" />
            <div className="h-8 rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  const items = data?.items || [];

  return (
    <div className={`${adminUi.chartCard} flex h-full min-h-0 flex-col`}>
      <div className="mb-3 flex shrink-0 items-center justify-between gap-2">
        <h3 className={adminUi.blockTitle}>待办事项</h3>
        {data && data.total > 0 && (
          <span className="rounded-full bg-warning/10 px-2 py-1 text-xs font-medium tabular-nums text-warning">
            共 {data.total} 项
          </span>
        )}
      </div>
      {items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-8 text-center text-sm text-brown-muted">
          暂无待办事项
        </div>
      ) : (
        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-y-contain">
          {items.map((item) => (
            <Link
              key={item.key}
              to={item.link}
              className="flex w-full items-center justify-between rounded-md p-3 text-left transition-colors hover:bg-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30"
            >
              <div className="flex items-center gap-3">
                <span className={`h-2 w-2 rounded-full ${item.count > 0 ? 'bg-warning' : 'bg-border'}`} />
                <span className="text-sm text-brown">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold tabular-nums ${item.count > 0 ? 'text-warning' : 'text-brown-muted'}`}>
                  {item.count}
                </span>
                <ChevronRight className="h-4 w-4 text-brown-muted" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
