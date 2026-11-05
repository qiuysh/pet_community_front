import type { ReactNode, MouseEvent } from 'react';
import { Button as HeroButton, buttonVariants } from '@heroui/react/button';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement> | unknown) => void;
  'aria-label'?: string;
  'aria-pressed'?: boolean | 'true' | 'false' | 'mixed';
  form?: string;
}

const variantMap: Record<ButtonVariant, 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'> = {
  primary: 'primary',
  secondary: 'secondary',
  ghost: 'ghost',
  danger: 'danger',
  outline: 'outline',
};

export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
  children,
  onClick,
  ...rest
}: ButtonProps) {
  return (
    <HeroButton
      type={type}
      variant={variantMap[variant]}
      size={size}
      fullWidth={block}
      isDisabled={disabled}
      isPending={loading}
      className={[
        variant === 'primary' ? 'shadow-brand hover:shadow-brand-hover' : '',
        'rounded-sm',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onPress={(e) => onClick?.(e)}
      {...rest}
    >
      {children}
    </HeroButton>
  );
}

export interface ButtonClassOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
}

/**
 * 导航型「按钮」的样式类：给 `<Link>` / `<a>` 复用 Button 视觉，
 * 避免 `<Link><Button/></Link>` 这类 a 内嵌 button 的非法结构。
 */
export function buttonClass({
  variant = 'primary',
  size = 'md',
  block = false,
  className = '',
}: ButtonClassOptions = {}): string {
  return [
    buttonVariants({ variant: variantMap[variant], size, fullWidth: block }),
    variant === 'primary' ? 'shadow-brand hover:shadow-brand-hover' : '',
    'rounded-sm',
    className,
  ]
    .filter(Boolean)
    .join(' ');
}
