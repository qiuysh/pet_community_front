import { Skeleton as HeroSkeleton } from '@heroui/react';

export interface SkeletonProps {
  className?: string;
  /** 圆形占位（头像等） */
  circle?: boolean;
}

export function Skeleton({ className = '', circle = false }: SkeletonProps) {
  return (
    <HeroSkeleton
      className={[
        'bg-muted rounded-sm',
        circle ? 'rounded-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  );
}
