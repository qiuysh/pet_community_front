import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';
import { Button } from './button';

const chevronProps = {
  size: ICON_SIZE.action,
  strokeWidth: iconStroke(ICON_SIZE.action),
  'aria-hidden': true as const,
};

export interface PaginationProps {
  /** 当前页码（从 1 开始） */
  page: number;
  /** 总页数 */
  totalPages: number;
  /** 翻页回调 */
  onPageChange: (page: number) => void;
  className?: string;
}

const PAGE_WINDOW = 5;

function buildPageWindow(page: number, totalPages: number): number[] {
  if (totalPages <= 1) return [];
  const len = Math.min(totalPages, PAGE_WINDOW);
  const pages: number[] = [];
  for (let i = 0; i < len; i++) {
    if (totalPages <= PAGE_WINDOW) {
      pages.push(i + 1);
    } else if (page <= 3) {
      pages.push(i + 1);
    } else if (page >= totalPages - 2) {
      pages.push(totalPages - PAGE_WINDOW + 1 + i);
    } else {
      pages.push(page - 2 + i);
    }
  }
  return pages;
}

/**
 * 前台通用分页：移动端图标 + 紧凑页码；桌面端页码按钮 + 文案。
 * 触控目标 ≥ 44px，单行不换行。
 */
export function Pagination({ page, totalPages, onPageChange, className = '' }: PaginationProps) {
  const pageNumbers = useMemo(() => buildPageWindow(page, totalPages), [page, totalPages]);

  if (totalPages <= 1) return null;

  const goPrev = () => onPageChange(Math.max(1, page - 1));
  const goNext = () => onPageChange(Math.min(totalPages, page + 1));

  return (
    <nav
      className={['pagination-ui mt-5 flex items-center justify-center gap-2 sm:gap-3', className]
        .filter(Boolean)
        .join(' ')}
      aria-label="分页"
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={goPrev}
        aria-label="上一页"
        className="h-11 min-w-11 shrink-0 gap-1 px-2.5 sm:min-w-0 sm:px-4"
      >
        <ChevronLeft {...chevronProps} />
        <span className="hidden sm:inline">上一页</span>
      </Button>

      {/* 移动端：紧凑「当前 / 总页」 */}
      <p
        className="min-w-[4.5rem] rounded-sm bg-soft px-3 py-2 text-center text-sm tabular-nums text-brown-secondary sm:hidden"
        aria-live="polite"
      >
        <span className="font-semibold text-primary-text">{page}</span>
        <span className="mx-1 text-brown-light">/</span>
        <span>{totalPages}</span>
      </p>

      {/* 桌面端：页码按钮 */}
      <div className="hidden items-center gap-1 sm:flex" role="list">
        {pageNumbers.map((num) => {
          const isCurrent = num === page;
          return (
            <Button
              key={num}
              type="button"
              variant={isCurrent ? 'secondary' : 'outline'}
              size="sm"
              aria-label={`第 ${num} 页`}
              aria-current={isCurrent ? 'page' : undefined}
              onClick={() => onPageChange(num)}
              className="h-10 min-w-10 px-3 tabular-nums"
            >
              {num}
            </Button>
          );
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={goNext}
        aria-label="下一页"
        className="h-11 min-w-11 shrink-0 gap-1 px-2.5 sm:min-w-0 sm:px-4"
      >
        <span className="hidden sm:inline">下一页</span>
        <ChevronRight {...chevronProps} />
      </Button>
    </nav>
  );
}
