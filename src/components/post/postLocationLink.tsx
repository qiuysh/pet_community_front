import { MapPin } from 'lucide-react';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';
import { hasPostCoordinates, openSystemMap } from '../../utils/postLocation';
import { useToast } from '../toast';

interface PostLocationLinkProps {
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
  className?: string;
}

/** 动态定位展示：有坐标则点击打开系统地图；仅文案时提示暂无精确坐标 */
export function PostLocationLink({
  location,
  latitude,
  longitude,
  className = 'post-location',
}: PostLocationLinkProps) {
  const toast = useToast();
  if (!location) return null;

  const canOpenMap = hasPostCoordinates(latitude, longitude);

  return (
    <button
      type="button"
      className={`${className} text-left`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!canOpenMap) {
          toast.info('暂无精确坐标，无法打开地图');
          return;
        }
        openSystemMap({ latitude, longitude, label: location });
      }}
      aria-label={canOpenMap ? `在地图中查看 ${location}` : location}
    >
      <MapPin size={ICON_SIZE.inline} strokeWidth={iconStroke(ICON_SIZE.inline)} aria-hidden="true" />
      <span>{location}</span>
    </button>
  );
}
