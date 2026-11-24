/**
 * 后台表格桥接：社区 Table（HeroUI）+ adminUi 表头/行样式。
 * 业务页禁止原生 <table>，统一走本组件。
 */
import type { ReactNode } from 'react';
import {
  Skeleton,
  Table,
  type TableBodyProps,
  type TableCellProps,
  type TableColumnProps,
  type TableHeaderProps,
  type TableRowProps,
} from '../ui';
import { EmptyState } from '../ui/emptyState';
import { adminUi } from '../../styles/adminUi';

function joinClass(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(' ');
}

function classNameProp(className: unknown): string {
  return typeof className === 'string' ? className : '';
}

export interface AdminTableProps {
  'aria-label': string;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}

function AdminTableRoot({
  'aria-label': ariaLabel,
  className = '',
  contentClassName = '',
  children,
}: AdminTableProps) {
  return (
    <Table variant="secondary" className={joinClass('w-full', className)}>
      <Table.ScrollContainer>
        <Table.Content aria-label={ariaLabel} className={joinClass('min-w-full', contentClassName)}>
          {children}
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}

function AdminTableHeader({ className, ...rest }: TableHeaderProps) {
  return <Table.Header className={joinClass(adminUi.tableHead, classNameProp(className))} {...rest} />;
}

function AdminTableColumn({ className, isRowHeader, ...rest }: TableColumnProps) {
  return (
    <Table.Column
      isRowHeader={isRowHeader}
      className={joinClass(adminUi.th, 'bg-soft', classNameProp(className))}
      {...rest}
    />
  );
}

function AdminTableBody({ className, ...rest }: TableBodyProps) {
  return <Table.Body className={joinClass('bg-white', classNameProp(className))} {...rest} />;
}

function AdminTableRow({ className, ...rest }: TableRowProps) {
  return <Table.Row className={joinClass(adminUi.tableRow, classNameProp(className))} {...rest} />;
}

function AdminTableCell({ className, ...rest }: TableCellProps) {
  return (
    <Table.Cell
      className={joinClass('px-6 py-4 text-sm text-brown align-middle', classNameProp(className))}
      {...rest}
    />
  );
}

function isEmptyishMessage(node: ReactNode): node is string {
  return typeof node === 'string' && /暂无|没有|无数据|为空/.test(node);
}

export interface AdminTableSkeletonProps {
  /** 占位行数，贴近当前页 pageSize 时跳版最小 */
  rows?: number;
  /** 占位列数，与真实表头列数一致 */
  columns?: number;
}

const skeletonWidths = ['w-4/5', 'w-full', 'w-2/3', 'w-3/4', 'w-1/2'];

/** 后台列表加载占位：与 AdminTable 同列宽/行高，供各列表页共用 */
export function AdminTableSkeleton({ rows = 6, columns = 5 }: AdminTableSkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-testid="admin-table-skeleton"
      className="min-w-0"
    >
      <span className="sr-only">加载中…</span>
      <div className="flex h-12 items-center gap-4 border-b border-border-light bg-soft px-6">
        {Array.from({ length: columns }, (_, index) => (
          <div key={index} className="min-w-0 flex-1">
            <Skeleton className="h-3 w-3/4" />
          </div>
        ))}
      </div>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div
          key={rowIndex}
          data-testid="admin-table-skeleton-row"
          className="flex h-14 items-center gap-4 border-b border-border-light px-6 last:border-b-0"
        >
          {Array.from({ length: columns }, (_, columnIndex) => (
            <div key={columnIndex} className="min-w-0 flex-1">
              <Skeleton
                className={joinClass('h-4', skeletonWidths[(rowIndex + columnIndex) % skeletonWidths.length])}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/** 加载中 / 空数据：放在表格外，避免 HeroUI 行列数约束 */
export function AdminTableStatus({ children }: { children: ReactNode }) {
  if (isEmptyishMessage(children)) {
    return (
      <div className="px-6 py-12" role="status" aria-live="polite">
        <EmptyState compact title={children} />
      </div>
    );
  }
  return (
    <div className="px-6 py-12 text-center text-brown-muted" role="status" aria-live="polite">
      {children}
    </div>
  );
}

export const AdminTable = Object.assign(AdminTableRoot, {
  Header: AdminTableHeader,
  Column: AdminTableColumn,
  Body: AdminTableBody,
  Row: AdminTableRow,
  Cell: AdminTableCell,
  Status: AdminTableStatus,
});
