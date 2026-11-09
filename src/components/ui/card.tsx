import type { HTMLAttributes, ReactNode } from 'react';
import { Card as HeroCard } from '@heroui/react/card';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const paddingClass = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
} as const;

export function Card({
  hoverable = false,
  padding = 'md',
  className = '',
  children,
  ...rest
}: CardProps) {
  return (
    <HeroCard
      className={[
        'bg-white rounded-md shadow-card overflow-hidden border-0',
        // motion-lift：PC 悬停抬升 + 阴影加深，移动端按下下沉（见 _motion.scss）
        hoverable ? 'motion-lift' : '',
        paddingClass[padding],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </HeroCard>
  );
}
