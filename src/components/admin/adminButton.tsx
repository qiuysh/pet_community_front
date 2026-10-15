/**
 * 后台按钮桥接：社区 Button（HeroUI）+ 青竹 / rounded-sm / 无品牌阴影。
 * 业务页勿直接写原生 <button>，统一走本组件。
 */
import type { ReactNode, MouseEvent } from 'react';
import { Button } from '../ui';

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
  form?: string;
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
    '!h-10 !min-h-10 !px-4 !rounded-sm !shadow-none !bg-error !text-white hover:!bg-error/90',
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
