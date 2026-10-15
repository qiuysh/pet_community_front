import type { ReactNode } from 'react';
import { Dropdown as HeroDropdown, Button as HeroButton } from '@heroui/react';

export interface DropdownItem {
  key: string;
  label: ReactNode;
  danger?: boolean;
  disabled?: boolean;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  onAction?: (key: string) => void;
  className?: string;
  'aria-label'?: string;
}

export function Dropdown({
  trigger,
  items,
  onAction,
  className = '',
  'aria-label': ariaLabel = '更多操作',
}: DropdownProps) {
  return (
    <HeroDropdown>
      <HeroDropdown.Trigger className={className}>
        {typeof trigger === 'string' ? (
          <HeroButton variant="ghost" size="sm" aria-label={ariaLabel}>
            {trigger}
          </HeroButton>
        ) : (
          trigger
        )}
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
