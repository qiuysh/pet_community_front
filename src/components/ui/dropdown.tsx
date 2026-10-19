import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { Dropdown as HeroDropdown } from '@heroui/react/dropdown';

export interface DropdownItem {
  key: string;
  label: ReactNode;
  danger?: boolean;
  disabled?: boolean;
}

export interface DropdownProps {
  /**
   * 触发器内容。Trigger 本身已是 button；
   * 若传入 Button / button 会自动拆出 children，避免嵌套 button 导致 hydration 报错。
   */
  trigger: ReactNode;
  items: DropdownItem[];
  onAction?: (key: string) => void;
  className?: string;
  'aria-label'?: string;
}

type TriggerLikeProps = {
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset' | string;
  'aria-label'?: string;
};

function isButtonLike(el: ReactElement): boolean {
  if (el.type === 'button') return true;
  const props = el.props as TriggerLikeProps;
  // 社区 Button 默认 type="button"；原生或其他带 button type 的包装也按按钮拆
  return props.type === 'button' || props.type === 'submit' || props.type === 'reset';
}

function resolveTrigger(trigger: ReactNode, fallbackLabel: string) {
  if (typeof trigger === 'string' || typeof trigger === 'number') {
    return {
      content: trigger,
      className: '',
      ariaLabel: fallbackLabel,
      isDisabled: false,
    };
  }

  if (isValidElement(trigger) && isButtonLike(trigger)) {
    const props = trigger.props as TriggerLikeProps;
    return {
      content: props.children,
      className: props.className ?? '',
      ariaLabel: props['aria-label'] ?? fallbackLabel,
      isDisabled: Boolean(props.disabled),
    };
  }

  return {
    content: trigger,
    className: '',
    ariaLabel: fallbackLabel,
    isDisabled: false,
  };
}

export function Dropdown({
  trigger,
  items,
  onAction,
  className = '',
  'aria-label': ariaLabel = '更多操作',
}: DropdownProps) {
  const resolved = resolveTrigger(trigger, ariaLabel);

  return (
    <HeroDropdown>
      <HeroDropdown.Trigger
        aria-label={resolved.ariaLabel}
        isDisabled={resolved.isDisabled}
        className={[
          'inline-flex items-center justify-center rounded-sm outline-none',
          resolved.className,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {resolved.content}
      </HeroDropdown.Trigger>
      <HeroDropdown.Popover>
        <HeroDropdown.Menu
          onAction={(key) => onAction?.(String(key))}
          className="min-w-[10rem] rounded-md shadow-medium bg-white border border-border p-1"
        >
          {items.map((item) => (
            <HeroDropdown.Item
              key={item.key}
              id={item.key}
              isDisabled={item.disabled}
              className={[
                'rounded-sm px-3 py-2 text-sm cursor-pointer',
                item.danger ? 'text-error' : 'text-brown',
              ].join(' ')}
            >
              {item.label}
            </HeroDropdown.Item>
          ))}
        </HeroDropdown.Menu>
      </HeroDropdown.Popover>
    </HeroDropdown>
  );
}
