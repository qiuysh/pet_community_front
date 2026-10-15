import type { ReactNode } from 'react';
import { Checkbox as HeroCheckbox } from '@heroui/react/checkbox';

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
  children?: ReactNode;
  'aria-label'?: string;
  /** 社区默认 primary；后台可用 secondary */
  tone?: 'primary' | 'secondary';
  /**
   * RAC/HeroUI Table 会注入 CheckboxContext（仅 selection 槽）。
   * 表内自定义勾选传 null；走表格内置多选时传 "selection"。
   */
  slot?: 'selection' | null;
}

/**
 * HeroUI 选中填充在 Control 的 ::before（bg-accent=蜜桃），
 * data-selected 在根节点。tone=secondary 时覆盖为青竹色，并去掉 field 阴影。
 */
const toneRoot: Record<'primary' | 'secondary', string> = {
  primary: '',
  secondary: [
    // 未选中：白底 + 边框、无阴影（对齐 adminUi 控件）
    '[&_[data-slot=checkbox-control]]:!shadow-none',
    '[&_[data-slot=checkbox-control]]:bg-white',
    '[&_[data-slot=checkbox-control]]:!border',
    '[&_[data-slot=checkbox-control]]:border-border',
    'hover:[&_[data-slot=checkbox-control]]:border-secondary/40',
    // 选中：青竹填充
    '[&_[data-slot=checkbox-control]]:before:bg-secondary',
    'data-[selected=true]:[&_[data-slot=checkbox-control]]:before:!bg-secondary',
    'data-[indeterminate=true]:[&_[data-slot=checkbox-control]]:before:!bg-secondary',
    'data-[indeterminate=true]:[&_[data-slot=checkbox-control]]:!bg-secondary',
    'data-[selected=true]:hover:[&_[data-slot=checkbox-control]]:before:!bg-secondary-dark',
    'data-[selected=true]:[&_[data-slot=checkbox-control]]:!border-transparent',
    'data-[selected=true]:hover:[&_[data-slot=checkbox-control]]:!border-transparent',
  ].join(' '),
};

const toneControl: Record<'primary' | 'secondary', string> = {
  primary: 'size-4 shrink-0 !rounded-[3px] border-border text-white before:!rounded-[3px]',
  secondary:
    'size-4 shrink-0 !rounded-[3px] !shadow-none border border-border bg-white text-white before:!rounded-[3px]',
};

export function Checkbox({
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  name,
  id,
  className = '',
  children,
  'aria-label': ariaLabel,
  tone = 'primary',
  slot,
}: CheckboxProps) {
  return (
    <HeroCheckbox
      id={id}
      name={name}
      isSelected={checked}
      defaultSelected={defaultChecked}
      isDisabled={disabled}
      onChange={onChange}
      aria-label={ariaLabel}
      slot={slot}
      variant={tone === 'secondary' ? 'secondary' : 'primary'}
      className={['inline-flex items-center gap-2', toneRoot[tone], className]
        .filter(Boolean)
        .join(' ')}
    >
      <HeroCheckbox.Content className="inline-flex cursor-pointer items-center gap-2">
        <HeroCheckbox.Control className={toneControl[tone]}>
          <HeroCheckbox.Indicator />
        </HeroCheckbox.Control>
        {children ? (
          <span className="text-sm text-brown-secondary">{children}</span>
        ) : null}
      </HeroCheckbox.Content>
    </HeroCheckbox>
  );
}
