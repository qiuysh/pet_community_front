import React, { useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import { useActiveAds } from '../../hooks/useActiveAds';
import { incrementAdView, incrementAdClick } from '../../api/ad';
import { AdLocation, Advertisement } from '../../types/advertisement';

/**
 * 前台广告位组件
 *
 * 用法:
 *   <AdBanner location="home_banner" />                    // 首页轮播:展示 1 条
 *   <AdBanner location="detail_sidebar" />                 // 详情侧边栏:展示 1 条
 *   <AdBanner location="topic_banner" limit={3} />          // 话题页横幅:展示 3 条
 *
 * 行为:
 * - 拉取生效中的广告(location 启用 + 时间窗 + status=1)。
 * - 加载中或无数据返回 null,避免占位导致布局抖动。
 * - 首次渲染后 fire-and-forget 上报 PV;点击锚点上报 Click。
 * - 跳转链接使用 target="_blank" + rel="sponsored noopener" 防止 referer 泄漏与 SEO 操控。
 */
export interface AdBannerProps {
  location: AdLocation;
  /** 显示前 N 条广告,默认 1 */
  limit?: number;
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ location, limit = 1, className }) => {
  const { loading, ads } = useActiveAds(location);

  if (loading || ads.length === 0) {
    return null;
  }

  const visibleAds = ads.slice(0, limit);

  return (
    <div className={`ad-banner space-y-2 ${className ?? ''}`} role="region" aria-label="广告">
      {visibleAds.map((ad) => (
        <AdBannerItem key={ad.id} ad={ad} />
      ))}
    </div>
  );
};

const AdBannerItem: React.FC<{ ad: Advertisement }> = ({ ad }) => {
  // useRef 防御 StrictMode 双调用导致 PV 重复上报
  const viewedRef = useRef(false);

  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    incrementAdView(ad.id);
  }, [ad.id]);

  const handleClick = () => {
    incrementAdClick(ad.id);
  };

  const content = (
    <div className="relative overflow-hidden">
      <img
        src={ad.imageUrl}
        alt={ad.title}
        loading="lazy"
        className="w-full h-auto object-cover block"
      />
      <div className="absolute left-0 bottom-0 right-0 flex items-center gap-2 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent">
        <span className="text-[10px] font-semibold text-white bg-primary px-1.5 py-0.5 rounded">
          广告
        </span>
        <span className="text-sm text-white truncate flex-1">{ad.title}</span>
        {ad.linkUrl && (
          <ExternalLink size={14} className="text-white/80 flex-shrink-0" aria-hidden="true" />
        )}
      </div>
    </div>
  );

  const shell = 'block bg-white rounded-md shadow-card overflow-hidden transition-shadow hover:shadow-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary animate-fadeIn';

  if (ad.linkUrl) {
    return (
      <a
        href={ad.linkUrl}
        target="_blank"
        rel="sponsored noopener noreferrer"
        onClick={handleClick}
        className={shell}
        aria-label={`广告: ${ad.title}`}
      >
        {content}
      </a>
    );
  }

  return (
    <div className={shell} role="img" aria-label={`广告: ${ad.title}`}>
      {content}
    </div>
  );
};

export default AdBanner;
