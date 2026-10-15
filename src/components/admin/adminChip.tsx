/**
 * 后台状态标签：ui 无 Badge，直连 HeroUI Chip。
 */
import type { ReactNode } from 'react';
import { Chip } from '@heroui/react/chip';

export type AdminChipTone = 'neutral' | 'secondary' | 'success' | 'warning' | 'danger';

const toneClass: Record<AdminChipTone, string> = {
  neutral: 'bg-soft text-brown-secondary',
  secondary: 'bg-secondary-soft text-secondary-dark',
  success: 'bg-success-soft text-success-dark',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-error/10 text-error',
};

export interface AdminChipProps {
  tone?: AdminChipTone;
  children: ReactNode;
  className?: string;
}

export function AdminChip({ tone = 'neutral', children, className = '' }: AdminChipProps) {
  return (
    <Chip
      className={['inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border-0', toneClass[tone], className]
        .filter(Boolean)
        .join(' ')}
    >
      <Chip.Label>{children}</Chip.Label>
    </Chip>
  );
}
