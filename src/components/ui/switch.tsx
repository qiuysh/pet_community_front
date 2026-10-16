import { Switch as HeroSwitch } from '@heroui/react/switch';

export type SwitchTone = 'primary' | 'secondary';

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
  /** 社区默认 primary（蜜桃 accent）；后台用 secondary（青竹） */
  tone?: SwitchTone;
  'aria-label'?: string;
}

const toneVars: Record<SwitchTone, string> = {
  primary: '',
  secondary:
    '[--switch-control-bg-checked:var(--color-secondary)] [--switch-control-bg-checked-hover:var(--color-secondary-dark)]',
};

/** 社区 Switch：业务层勿直接 import @heroui/react */
export function Switch({
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  name,
  id,
  className = '',
  tone = 'primary',
  'aria-label': ariaLabel,
}: SwitchProps) {
  return (
    <HeroSwitch
      id={id}
      name={name}
      isSelected={checked}
      defaultSelected={defaultChecked}
      isDisabled={disabled}
      onChange={onChange}
      aria-label={ariaLabel}
      className={['inline-flex items-center', toneVars[tone], className].filter(Boolean).join(' ')}
    >
      {/* Content = 可点击的 SwitchButton；缺省则无法切换 */}
      <HeroSwitch.Content className="inline-flex cursor-pointer items-center outline-none">
        <HeroSwitch.Control>
          <HeroSwitch.Thumb />
        </HeroSwitch.Control>
      </HeroSwitch.Content>
    </HeroSwitch>
  );
}
