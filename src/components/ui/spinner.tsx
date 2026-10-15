import { Spinner as HeroSpinner } from '@heroui/react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export function Spinner({ size = 'md', className = '', label }: SpinnerProps) {
  return (
    <div className={['inline-flex flex-col items-center gap-2', className].join(' ')}>
      <HeroSpinner size={size} className="text-primary" aria-label={label || '加载中'} />
      {label ? <span className="text-sm text-brown-muted">{label}</span> : null}
    </div>
  );
}
