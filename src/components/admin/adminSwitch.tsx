/**
 * 后台 Switch 桥接：社区 Switch（HeroUI）+ 青竹选中态。
 */
import { Switch } from '../ui';

export interface AdminSwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
  'aria-label'?: string;
}

export function AdminSwitch({
  checked,
  defaultChecked,
  onChange,
  disabled,
  name,
  id,
  className = '',
  'aria-label': ariaLabel,
}: AdminSwitchProps) {
  return (
    <Switch
      id={id}
      name={name}
      checked={checked}
      defaultChecked={defaultChecked}
      onChange={onChange}
      disabled={disabled}
      aria-label={ariaLabel}
      className={className}
    />
  );
}
