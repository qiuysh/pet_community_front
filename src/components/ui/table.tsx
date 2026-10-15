/**
 * 社区 Table：HeroUI Table 适配层。业务页勿直接 import @heroui/react。
 */
import type { ComponentProps, ReactNode } from 'react';
import { Table as HeroTable } from '@heroui/react/table';

export type TableRootProps = ComponentProps<typeof HeroTable>;
export type TableContentProps = ComponentProps<typeof HeroTable.Content>;
export type TableHeaderProps = ComponentProps<typeof HeroTable.Header>;
export type TableColumnProps = ComponentProps<typeof HeroTable.Column>;
export type TableBodyProps = ComponentProps<typeof HeroTable.Body>;
export type TableRowProps = ComponentProps<typeof HeroTable.Row>;
export type TableCellProps = ComponentProps<typeof HeroTable.Cell>;

function joinClass(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(' ');
}

function TableRoot({ className = '', variant = 'primary', children, ...rest }: TableRootProps) {
  return (
    <HeroTable variant={variant} className={joinClass('w-full', className)} {...rest}>
      {children}
    </HeroTable>
  );
}

function TableScrollContainer({
  className = '',
  children,
  ...rest
}: ComponentProps<typeof HeroTable.ScrollContainer>) {
  return (
    <HeroTable.ScrollContainer className={joinClass('overflow-x-auto', className)} {...rest}>
      {children}
    </HeroTable.ScrollContainer>
  );
}

function TableContent({ className = '', children, ...rest }: TableContentProps) {
  return (
    <HeroTable.Content className={joinClass('min-w-full', className)} {...rest}>
      {children}
    </HeroTable.Content>
  );
}

function TableHeader(props: TableHeaderProps) {
  return <HeroTable.Header {...props} />;
}

function TableColumn({ className = '', ...rest }: TableColumnProps) {
  return <HeroTable.Column className={className} {...rest} />;
}

function TableBody(props: TableBodyProps) {
  return <HeroTable.Body {...props} />;
}

function TableRow({ className = '', ...rest }: TableRowProps) {
  return <HeroTable.Row className={className} {...rest} />;
}

function TableCell({ className = '', ...rest }: TableCellProps) {
  return <HeroTable.Cell className={className} {...rest} />;
}

export const Table = Object.assign(TableRoot, {
  Root: TableRoot,
  ScrollContainer: TableScrollContainer,
  Content: TableContent,
  Header: TableHeader,
  Column: TableColumn,
  Body: TableBody,
  Row: TableRow,
  Cell: TableCell,
});

export type { ReactNode };
