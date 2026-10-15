/**
 * 后台 Checkbox 桥接：社区 Checkbox（HeroUI）+ secondary 选中态。
 */
import type { ReactNode } from 'react';
import { Checkbox } from '../ui';

export interface AdminCheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
  children?: ReactNode;
  'aria-label'?: string;
  /**
   * 默认 null：后台多为表内自定义勾选，避免 RAC Table 要求 slot="selection"。
   * 若改用 Table selectionMode，传 "selection"。
   */
  slot?: 'selection' | null;
}

export function AdminCheckbox({
  checked,
  defaultChecked,
  onChange,
  disabled,
  name,
  id,
  className = '',
  children,
  'aria-label': ariaLabel,
  slot = null,
}: AdminCheckboxProps) {
  return (
    <Checkbox
      id={id}
      name={name}
      checked={checked}
      defaultChecked={defaultChecked}
      onChange={onChange}
      disabled={disabled}
      aria-label={ariaLabel}
      tone="secondary"
      className={className}
      slot={slot}
    >
      {children}
    </Checkbox>
  );
}
