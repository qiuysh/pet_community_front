/**
 * 后台分区 Tab：切换整页视图（通知/公告、待审/历史、日志类型等）。
 * 宽度随文案自适应（min-w，非固定等分）；在 AdminPageHeader 中独占一行。
 */
import { Tabs } from '../ui';

function joinClass(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export interface AdminTabItem {
  key: string;
  label: string;
}

export interface AdminTabsProps {
  items: AdminTabItem[];
  selectedKey: string;
  onSelectionChange: (key: string) => void;
  className?: string;
  'aria-label'?: string;
}

export function AdminTabs({
  items,
  selectedKey,
  onSelectionChange,
  className = '',
  'aria-label': ariaLabel = '分区',
}: AdminTabsProps) {
  return (
    <Tabs
      listOnly
      tone="secondary"
      aria-label={ariaLabel}
      className={joinClass('inline-flex w-fit max-w-full', className)}
      selectedKey={selectedKey}
      onSelectionChange={onSelectionChange}
      items={items.map((item) => ({ key: item.key, title: item.label }))}
    />
  );
}
