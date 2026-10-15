/**
 * 后台表格桥接：社区 Table（HeroUI）+ adminUi 表头/行样式。
 * 业务页禁止原生 <table>，统一走本组件。
 */
import type { ReactNode } from 'react';
import {
  Table,
  type TableBodyProps,
  type TableCellProps,
  type TableColumnProps,
  type TableHeaderProps,
  type TableRowProps,
} from '../ui';
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

/** 加载中 / 空数据：放在表格外，避免 HeroUI 行列数约束 */
export function AdminTableStatus({ children }: { children: ReactNode }) {
  return <div className="px-6 py-12 text-center text-brown-muted">{children}</div>;
}

export const AdminTable = Object.assign(AdminTableRoot, {
  Header: AdminTableHeader,
  Column: AdminTableColumn,
  Body: AdminTableBody,
  Row: AdminTableRow,
  Cell: AdminTableCell,
  Status: AdminTableStatus,
});
