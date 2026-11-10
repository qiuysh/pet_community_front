import {
  BookOpen,
  Compass,
  Cookie,
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
 * 同时覆盖 create.sql 种子名与历史/兜底种子名；未知分类回落 Compass。
 */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  // create.sql / 线上种子
  日常分享: Sparkles,
  养宠知识: BookOpen,
  美食教程: Cookie,
  健康医疗: HeartPulse,
  萌宠趣事: Laugh,
  // InitDefaultCategories / 历史别名
  萌宠日常: Sparkles,
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
