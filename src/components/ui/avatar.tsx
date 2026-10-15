import type { ReactNode } from 'react';
import { Avatar as HeroAvatar } from '@heroui/react/avatar';

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fallback?: ReactNode;
}

const sizeClass = {
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-14',
} as const;

function initials(name?: string) {
  if (!name) return '?';
  return name.trim().slice(0, 1).toUpperCase();
}

export function Avatar({
  src,
  alt = '',
  name,
  size = 'md',
  className = '',
  fallback,
}: AvatarProps) {
  return (
    <HeroAvatar className={[sizeClass[size], 'rounded-full shrink-0', className].join(' ')}>
      {src ? <HeroAvatar.Image src={src} alt={alt || name || ''} /> : null}
      <HeroAvatar.Fallback className="bg-primary-soft text-primary text-sm font-medium">
        {fallback ?? initials(name || alt)}
      </HeroAvatar.Fallback>
    </HeroAvatar>
  );
}
