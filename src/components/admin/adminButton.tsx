/**
 * 后台按钮桥接：社区 Button（HeroUI）+ 青竹 / rounded-sm / 无品牌阴影。
 * 业务页勿直接写原生 <button>，统一走本组件。
 * 导航型外观给 `<Link>` 用时走 `adminButtonClass`，避免 a 内嵌 button。
 */
import type { ReactNode, MouseEvent } from 'react';
import { Button, buttonClass } from '../ui';

export type AdminButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
export type AdminButtonSize = 'sm' | 'md' | 'lg';

export interface AdminButtonProps {
  variant?: AdminButtonVariant;
  size?: AdminButtonSize;
  loading?: boolean;
  block?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement> | unknown) => void;
  'aria-label'?: string;
  'aria-expanded'?: boolean | 'true' | 'false';
  'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  'aria-controls'?: string;
  'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false';
  role?: string;
  form?: string;
}

export interface AdminButtonClassOptions {
  variant?: AdminButtonVariant;
  size?: AdminButtonSize;
  block?: boolean;
  className?: string;
}

/** 映射到社区 Button variant；主操作统一 secondary（青竹） */
const toUiVariant: Record<AdminButtonVariant, 'secondary' | 'outline' | 'danger' | 'ghost'> = {
  primary: 'secondary',
  secondary: 'secondary',
  outline: 'outline',
  danger: 'danger',
  ghost: 'ghost',
};

const variantClass: Record<AdminButtonVariant, string> = {
  primary:
    '!h-10 !min-h-10 !px-4 !rounded-sm !shadow-none !bg-secondary !text-white hover:!bg-secondary-dark',
  secondary:
    '!h-10 !min-h-10 !px-4 !rounded-sm !shadow-none !bg-secondary !text-white hover:!bg-secondary-dark',
  outline:
    '!h-10 !min-h-10 !px-4 !rounded-sm !shadow-none !border-0 !bg-soft !text-brown-secondary hover:!bg-muted',
  danger:
    '!h-10 !min-h-10 !px-4 !rounded-sm !shadow-none !bg-error-dark !text-white hover:!bg-error-dark/90',
  ghost:
    '!h-auto !min-h-0 !px-1.5 !py-1 !rounded-none !shadow-none !bg-transparent !border-0 font-medium text-brown-secondary hover:!bg-transparent hover:text-brown',
};

const sizeClass: Record<AdminButtonSize, string> = {
  sm: '!h-8 !min-h-8 !px-2.5 text-sm',
  md: '',
  lg: '!h-11 !px-5 text-base',
};

function joinClass(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export function AdminButton({
  variant = 'secondary',
  size = 'md',
  loading = false,
  block = false,
  disabled = false,
  className = '',
  type = 'button',
  children,
  onClick,
  ...rest
}: AdminButtonProps) {
  return (
    <Button
      type={type}
      variant={toUiVariant[variant]}
      size={size}
      block={block}
      disabled={disabled || loading}
      loading={loading}
      className={joinClass(variantClass[variant], sizeClass[size], className)}
      onClick={onClick}
      {...rest}
    >
      {children}
    </Button>
  );
}

/** 导航型「按钮」样式：供 `<Link>` / `<a>` 复用 AdminButton 视觉 */
export function adminButtonClass({
  variant = 'secondary',
  size = 'md',
  block = false,
  className = '',
}: AdminButtonClassOptions = {}): string {
  return joinClass(
    buttonClass({ variant: toUiVariant[variant], size, block }),
    variantClass[variant],
    sizeClass[size],
    className,
  );
}
