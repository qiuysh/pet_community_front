import { useState } from 'react';
import { ImageOff, PawPrint } from 'lucide-react';
import { ICON_SIZE, iconStroke } from '../../styles/iconSize';

interface PostImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  loading?: 'lazy' | 'eager';
}

/**
 * 动态配图：加载失败时展示宠社区向占位，避免浏览器破图图标。
 */
export function PostImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  loading = 'lazy',
}: PostImageProps) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <div
        className={`post-image-fallback ${className}`.trim()}
        role="img"
        aria-label={`${alt}（加载失败）`}
      >
        <PawPrint
          size={ICON_SIZE.feature}
          strokeWidth={iconStroke(ICON_SIZE.feature)}
          className="post-image-fallback__paw"
          aria-hidden="true"
        />
        <span className="post-image-fallback__text">
          <ImageOff
            size={ICON_SIZE.inline}
            strokeWidth={iconStroke(ICON_SIZE.inline)}
            aria-hidden="true"
          />
          图片暂时看不到
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={imgClassName}
      loading={loading}
      decoding="async"
      onError={() => setBroken(true)}
    />
  );
}
