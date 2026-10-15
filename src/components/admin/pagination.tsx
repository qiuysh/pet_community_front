import { useMemo } from 'react';
import { AdminButton } from './adminButton';

interface PaginationProps {
  /** 当前页码（从 1 开始） */
  currentPage: number;
  /** 总记录数 */
  total: number;
  /** 每页条数 */
  pageSize: number;
  /** 翻页回调，参数为目标页码 */
  onPageChange: (page: number) => void;
}

/**
 * 后台通用分页：与列表工具栏同款 AdminButton。
 */
export function Pagination({ currentPage, total, pageSize, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);

  const pageNumbers = useMemo<number[]>(() => {
    if (totalPages <= 1) return [];
    const len = Math.min(totalPages, 5);
    const result: number[] = [];
    for (let i = 0; i < len; i++) {
      if (totalPages <= 5) {
        result.push(i + 1);
      } else if (currentPage <= 3) {
        result.push(i + 1);
      } else if (currentPage >= totalPages - 2) {
        result.push(totalPages - 4 + i);
      } else {
        result.push(currentPage - 2 + i);
      }
    }
    return result;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);

  return (
    <div className="px-6 py-4 border-t border-border-light">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-brown-secondary">
          显示第 <span className="font-medium text-brown">{start}</span> 到{' '}
          <span className="font-medium text-brown">{end}</span> 条，共{' '}
          <span className="font-medium text-brown">{total.toLocaleString()}</span> 条
        </div>
        <nav className="inline-flex items-center gap-1" aria-label="分页">
          <AdminButton
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            aria-label="上一页"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className="min-w-9 px-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </AdminButton>
          {pageNumbers.map((pageNum) => (
            <AdminButton
              key={pageNum}
              type="button"
              variant={pageNum === currentPage ? 'secondary' : 'outline'}
              size="sm"
              aria-current={pageNum === currentPage ? 'page' : undefined}
              onClick={() => onPageChange(pageNum)}
              className="min-w-9 px-3"
            >
              {pageNum}
            </AdminButton>
          ))}
          <AdminButton
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            aria-label="下一页"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className="min-w-9 px-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </AdminButton>
        </nav>
      </div>
    </div>
  );
}
