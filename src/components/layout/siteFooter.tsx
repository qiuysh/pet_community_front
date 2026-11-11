import { useSiteConfigStore } from '../../stores/siteConfigStore';
import { DEFAULT_SITE_NAME } from '../../utils/documentTitle';

/**
 * 前台页脚：站点描述 + ICP 备案号。
 * 两者都未配置时不渲染，避免出现空占位。
 */
export function SiteFooter() {
  const siteName = useSiteConfigStore((state) => state.siteName) || DEFAULT_SITE_NAME;
  const siteDescription = useSiteConfigStore((state) => state.siteDescription);
  const siteICP = useSiteConfigStore((state) => state.siteICP);

  if (!siteDescription && !siteICP) {
    return null;
  }

  return (
    <footer className="site-footer">
      {siteDescription && <p className="site-footer-desc">{siteDescription}</p>}
      <p className="site-footer-meta">
        <span>© {new Date().getFullYear()} {siteName}</span>
        {siteICP && (
          <a
            className="site-footer-icp"
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noreferrer noopener"
          >
            {siteICP}
          </a>
        )}
      </p>
    </footer>
  );
}
