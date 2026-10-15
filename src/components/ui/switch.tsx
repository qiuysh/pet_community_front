import { Switch as HeroSwitch } from '@heroui/react';

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
      className={['inline-flex items-center', className].filter(Boolean).join(' ')}
    >
      <HeroSwitch.Control
        className={[
          'h-7 w-12 rounded-full bg-border transition-colors',
          'data-[selected=true]:bg-secondary',
          'data-[focus-visible=true]:outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-secondary/30',
        ].join(' ')}
      >
        <HeroSwitch.Thumb
          className={[
            'size-5 rounded-full bg-white shadow-sm transition-transform',
            'translate-x-1 data-[selected=true]:translate-x-6',
          ].join(' ')}
        />
      </HeroSwitch.Control>
    </HeroSwitch>
  );
}
