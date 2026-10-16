import { Switch as HeroSwitch } from '@heroui/react/switch';

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
  'aria-label'?: string;
}

/** 社区 Switch：业务层勿直接 import @heroui/react */
export function Switch({
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  name,
  id,
  className = '',
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
      className={['group inline-flex items-center', className].filter(Boolean).join(' ')}
    >
      {/* Content = 可点击的 SwitchButton；缺省则无法切换 */}
      <HeroSwitch.Content className="inline-flex cursor-pointer items-center outline-none">
        <HeroSwitch.Control
          className={[
            'h-7 w-12 rounded-full bg-border transition-colors',
            'group-data-[selected=true]:bg-secondary',
            'group-data-[focus-visible=true]:ring-2 group-data-[focus-visible=true]:ring-secondary/30',
          ].join(' ')}
        >
          <HeroSwitch.Thumb
            className={[
              'size-5 rounded-full bg-white shadow-sm transition-transform',
              'translate-x-1 group-data-[selected=true]:translate-x-6',
            ].join(' ')}
          />
        </HeroSwitch.Control>
      </HeroSwitch.Content>
    </HeroSwitch>
  );
}
