/**
 * 后台列表筛选栏（扁平，与 page 卡一体）：
 * - 固定枚举 / 动态列表 → AdminSelect
 * - 分区 Tabs → 放 AdminPageHeader，勿塞进本栏
 * - 网格统一用 adminUi.filterFields
 */
import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { AdminLabel } from './adminField';
import { adminUi } from '../../styles/adminUi';

function joinClass(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export interface AdminPageHeaderProps {
  title: string;
  description?: string;
  /** 分区 Tabs（与主操作同行，不占筛选行） */
  tabs?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/** 统一页头：标题 / Tabs / 主操作 */
export function AdminPageHeader({
  title,
  description,
  tabs,
  actions,
  className = '',
}: AdminPageHeaderProps) {
  const right = tabs || actions ? (
    <div className={adminUi.pageHeaderActions}>
      {tabs}
      {actions}
    </div>
  ) : null;

  return (
    <div className={joinClass(adminUi.pageHeader, className)}>
      <div className="min-w-0">
        <h1 className={adminUi.pageTitle}>{title}</h1>
        {description ? <p className={adminUi.pageDesc}>{description}</p> : null}
      </div>
      {right}
    </div>
  );
}

export interface AdminFilterFieldProps {
  label: string;
  htmlFor: string;
  className?: string;
  children: ReactNode;
}

/** 带关联标签的筛选项（必须 htmlFor ↔ 控件 id） */
export function AdminFilterField({
  label,
  htmlFor,
  className = '',
  children,
}: AdminFilterFieldProps) {
  const enhanced = Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    const el = child as ReactElement<{ id?: string; 'aria-label'?: string }>;
    return cloneElement(el, {
      id: el.props.id ?? htmlFor,
      'aria-label': el.props['aria-label'] ?? label,
    });
  });

  return (
    <div className={joinClass('flex min-w-0 items-center gap-2', className)}>
      <AdminLabel htmlFor={htmlFor} className={adminUi.filterFieldLabel}>
        {label}
      </AdminLabel>
      <div className="min-w-0 flex-1">{enhanced}</div>
    </div>
  );
}

export interface AdminFilterBarProps {
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/**
 * 扁平筛选行：字段网格 + 操作按钮；无 soft 内嵌卡片。
 */
export function AdminFilterBar({ children, actions, className = '' }: AdminFilterBarProps) {
  if (!children && !actions) return null;

  return (
    <div
      role="search"
      className={joinClass(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3',
        className,
      )}
    >
      {children ? <div className={adminUi.filterFields}>{children}</div> : null}
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

/** @deprecated 使用扁平 AdminFilterBar；保留导出避免旧引用瞬时断裂 */
export function AdminFilterPanel({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={joinClass(className)}>{children}</div>;
}
