import { Bird, Cat, Dog, Fish, Image, FileText, PawPrint, Video } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';

interface PetIconProps {
  type: string;
  size?: number;
  color?: string;
}

interface PostIconProps {
  type: string;
  size?: number;
  color?: string;
}

const PET_ICONS: Record<string, LucideIcon> = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  fish: Fish,
  other: PawPrint,
};

const POST_ICONS: Record<string, LucideIcon> = {
  image: Image,
  video: Video,
  text: FileText,
};

/** 筛选 Chip 内宠物类型图标（默认 ICON_SIZE.action） */
export const PetIcon = ({
  type,
  size = ICON_SIZE.action,
  color = 'currentColor',
}: PetIconProps) => {
  const Icon = PET_ICONS[type] || PET_ICONS.other;
  return (
    <Icon
      size={size}
      color={color}
      strokeWidth={iconStroke(size)}
      aria-hidden="true"
      className="filter-pet-icon"
    />
  );
};

/** 筛选 Chip 内内容类型图标（默认 ICON_SIZE.action） */
export const PostIcon = ({
  type,
  size = ICON_SIZE.action,
  color = 'currentColor',
}: PostIconProps) => {
  const Icon = POST_ICONS[type] || POST_ICONS.text;
  return (
    <Icon
      size={size}
      color={color}
      strokeWidth={iconStroke(size)}
      aria-hidden="true"
      className="filter-post-icon"
    />
  );
};
