import {
  BookOpen,
  Compass,
  HeartHandshake,
  HeartPulse,
  Laugh,
  PartyPopper,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';

interface CategoryIconProps {
  categoryName: string;
  size?: number;
  color?: string;
  className?: string;
}

/**
 * 话题分类图标：按名称映射 Lucide，语义清晰、与全站线性风格一致。
 * 未知分类回落 Compass（发现语境）。
 */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  萌宠日常: Sparkles,
  养宠知识: BookOpen,
  宠物健康: HeartPulse,
  搞笑萌宠: Laugh,
  领养送养: HeartHandshake,
  宠物活动: PartyPopper,
};

export const CategoryIcon = ({
  categoryName,
  size = ICON_SIZE.feature,
  color = 'currentColor',
  className,
}: CategoryIconProps) => {
  const Icon = CATEGORY_ICONS[categoryName] || Compass;

  return (
    <Icon
      size={size}
      color={color}
      strokeWidth={iconStroke(size)}
      className={className}
      aria-hidden="true"
    />
  );
};
