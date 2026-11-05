import type { ReactNode } from 'react';
import { BackButton } from './backButton';

export interface PageHeaderProps {
  title: ReactNode;
  /** 是否显示返回按钮，默认显示 */
  back?: boolean;
  /** 无站内历史时的回退地址 */
  fallbackTo?: string;
  /** 右侧操作区；不传时留等宽占位，保持标题视觉居中 */
  right?: ReactNode;
  /** 是否吸顶，默认 true */
  sticky?: boolean;
  className?: string;
}

/**
 * 标准内页页头：返回 + 居中标题 + 右侧操作。
 * 渐变头（发现页 / 排行榜 / 话题广场）有独立装饰与筛选器，不使用本组件。
 */
export function PageHeader({
  title,
  back = true,
  fallbackTo,
  right,
  sticky = true,
  className = '',
}: PageHeaderProps) {
  return (
    <header
      className={[
        'flex items-center gap-2 bg-white px-4 py-3 shadow-card',
        sticky ? 'sticky top-0 z-30' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex w-10 shrink-0 items-center">{back ? <BackButton fallbackTo={fallbackTo} /> : null}</div>
      <h1 className="min-w-0 flex-1 truncate text-center text-[18px] font-semibold text-brown">{title}</h1>
      <div className="flex min-w-10 shrink-0 items-center justify-end gap-1">{right}</div>
    </header>
  );
}
