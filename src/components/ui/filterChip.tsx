import type { ReactNode, MouseEvent } from 'react';
import { Button as HeroButton } from '@heroui/react/button';

export interface FilterChipProps {
  active?: boolean;
  tone?: 'primary' | 'secondary';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement> | unknown) => void;
  disabled?: boolean;
}

/** 列表页筛选芯片，统一圆角与选中态；active 时带 .active 供页面 SCSS 挂钩 */
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
      aria-pressed={active}
      className={[
        'filter-chip-base inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium min-w-0 h-auto',
        active ? `active ${activeClass}` : 'bg-muted text-brown-secondary hover:bg-border-light',
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
