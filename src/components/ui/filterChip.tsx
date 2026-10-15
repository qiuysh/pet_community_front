import type { ReactNode, MouseEvent } from 'react';
import { Button as HeroButton } from '@heroui/react';

export interface FilterChipProps {
  active?: boolean;
  tone?: 'primary' | 'secondary';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement> | unknown) => void;
  disabled?: boolean;
}

/** 列表页筛选芯片，统一圆角与选中态 */
export function FilterChip({
  active = false,
  tone = 'primary',
  className = '',
  type = 'button',
  children,
  onClick,
  disabled = false,
}: FilterChipProps) {
  const activeClass =
    tone === 'secondary' ? 'bg-secondary text-white' : 'bg-primary text-white';

  return (
    <HeroButton
      type={type}
      size="sm"
      variant={active ? (tone === 'secondary' ? 'secondary' : 'primary') : 'tertiary'}
      isDisabled={disabled}
      className={[
        'px-3 py-1.5 rounded-sm text-sm font-medium min-w-0 h-auto',
        active ? activeClass : 'bg-muted text-brown-secondary hover:bg-border-light',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onPress={(e) => onClick?.(e)}
    >
      {children}
    </HeroButton>
  );
}
