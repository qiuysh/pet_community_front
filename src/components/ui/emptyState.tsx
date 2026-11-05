import type { ReactNode } from 'react';

export interface EmptyStateProps {
  /** 可选图标，建议 48px 以内、使用 currentColor */
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** 行动按钮（如「发起对话」「去发布」） */
  action?: ReactNode;
  /** 嵌入 tab / 卡片内的小空态 */
  compact?: boolean;
  className?: string;
}

/** 统一空态：图标（可选）+ 标题 + 说明（可选）+ 行动（可选） */
export function EmptyState({
  icon,
  title,
  description,
  action,
  compact = false,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center text-center',
        compact ? 'px-4 py-8' : 'px-5 py-16',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon ? (
        <div className="mb-3 text-brown-light" aria-hidden="true">
          {icon}
        </div>
      ) : null}
      <p className={compact ? 'text-sm text-brown-muted' : 'text-[15px] text-brown-secondary'}>{title}</p>
      {description ? <p className="mt-1 text-[13px] text-brown-muted">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
